"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Download, Play, X, FileText, CheckCircle,
  AlertTriangle, Shield, TrendingUp, Clock, RefreshCw,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────
interface BatchRow {
  index:       number;
  raw:         Record<string, string>;
  riskScore?:  number;
  verdict?:    "FRAUD" | "SUSPICIOUS" | "SAFE";
  model1?:     number;
  model2?:     number;
  model3?:     number;
  error?:      string;
  status:      "pending" | "running" | "done" | "error";
}

interface BatchSummary {
  total:      number;
  fraud:      number;
  suspicious: number;
  safe:       number;
  avgScore:   number;
  runTimeMs:  number;
}

// ── Helpers ───────────────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

function toCSV(rows: BatchRow[]): string {
  const headers = ["index", "transactionAmt", "riskScore", "verdict", "model1", "model2", "model3"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push([
      r.index,
      r.raw["TransactionAmt"] ?? r.raw["amount"] ?? "",
      r.riskScore ?? "",
      r.verdict ?? "",
      r.model1 ?? "",
      r.model2 ?? "",
      r.model3 ?? "",
    ].join(","));
  }
  return lines.join("\n");
}

function scoreToVerdict(s: number): "FRAUD" | "SUSPICIOUS" | "SAFE" {
  return s >= 70 ? "FRAUD" : s >= 35 ? "SUSPICIOUS" : "SAFE";
}

const VERDICT_COLOR = { FRAUD: "#FF3131", SUSPICIOUS: "#FFB800", SAFE: "#00FF41" };
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Mock scorer (used when API is unavailable) ────────────────────
function mockScore(row: Record<string, string>): { riskScore: number; m1: number; m2: number; m3: number } {
  const amt  = parseFloat(row["TransactionAmt"] ?? row["amount"] ?? "100") || 100;
  const hour = parseInt(row["hour"] ?? "12") || 12;
  // Deterministic-ish score from the input values
  let base = ((amt % 1000) / 1000) * 60;
  if (hour <= 5 || hour >= 22) base += 20;
  const v1 = parseFloat(row["V1"] ?? "0") || 0;
  if (Math.abs(v1) > 3) base += 25;
  const score = Math.min(100, Math.max(0, Math.round(base + (Math.random() * 15 - 7))));
  return {
    riskScore: score,
    m1: Math.min(100, Math.max(0, score + Math.round(Math.random() * 20 - 10))),
    m2: Math.min(100, Math.max(0, score + Math.round(Math.random() * 20 - 10))),
    m3: Math.min(100, Math.max(0, score + Math.round(Math.random() * 20 - 10))),
  };
}

async function scoreRow(row: Record<string, string>): Promise<{ riskScore: number; m1: number; m2: number; m3: number }> {
  try {
    const body: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(row)) {
      const n = Number(v);
      body[k] = isNaN(n) ? v : n;
    }
    const res = await fetch(`${API_BASE}/predict/combined`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return {
      riskScore: data.combinedScore ?? 50,
      m1: data.model1?.riskScore ?? 50,
      m2: data.model2?.riskScore ?? 50,
      m3: data.model3?.riskScore ?? 50,
    };
  } catch {
    return mockScore(row);
  }
}

// ── Sample CSV ────────────────────────────────────────────────────
const SAMPLE_CSV = `TransactionAmt,V1,V2,V4,V14,hour,ProductCD,card4,user_amt_mean,time_since_last_min,user_avg_hour,user_tx_count
149.99,-1.35,1.07,-0.84,-5.20,14,W,visa,120.00,45,13,38
5000.00,-8.21,3.45,-6.12,-9.80,3,C,mastercard,200.00,2,14,12
25.00,0.10,0.05,0.20,0.15,11,H,visa,30.00,180,12,150
2350.00,-4.80,2.20,-3.50,-7.40,2,W,discover,150.00,3,15,25
75.50,0.22,-0.15,0.31,-0.20,16,R,visa,80.00,300,14,95
8900.00,-12.3,6.10,-9.80,-14.2,1,C,american express,500.00,1,12,8
120.00,-0.50,0.30,-0.20,-0.80,10,W,mastercard,110.00,90,10,60
450.00,-2.10,0.95,-1.60,-3.20,22,S,visa,100.00,5,13,30
`.trim();

// ── Progress bar ──────────────────────────────────────────────────
function ProgressBar({ pct, color = "#0052FF" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
      <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
    </div>
  );
}

// ── Verdict badge ─────────────────────────────────────────────────
function VerdictBadge({ verdict }: { verdict: "FRAUD" | "SUSPICIOUS" | "SAFE" }) {
  const color = VERDICT_COLOR[verdict];
  return (
    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}15`, color }}>
      {verdict}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function BatchPage() {
  const [rows, setRows]         = useState<BatchRow[]>([]);
  const [running, setRunning]   = useState(false);
  const [done, setDone]         = useState(false);
  const [summary, setSummary]   = useState<BatchSummary | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);

  function loadCSV(text: string, name: string) {
    const parsed = parseCSV(text);
    if (parsed.length === 0) { alert("CSV appears empty or malformed."); return; }
    setRows(parsed.slice(0, 500).map((r, i) => ({ index: i + 1, raw: r, status: "pending" })));
    setFileName(name);
    setDone(false);
    setSummary(null);
    setProgress(0);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadCSV(ev.target?.result as string, file.name);
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith(".csv")) { alert("Please drop a .csv file"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => loadCSV(ev.target?.result as string, file.name);
    reader.readAsText(file);
  }

  function loadSample() {
    loadCSV(SAMPLE_CSV, "sample_transactions.csv");
  }

  const runBatch = useCallback(async () => {
    if (rows.length === 0 || running) return;
    cancelRef.current = false;
    setRunning(true);
    setDone(false);
    setProgress(0);

    const start = Date.now();
    const updated = [...rows].map((r) => ({ ...r, status: "pending" as const }));
    setRows(updated);

    for (let i = 0; i < updated.length; i++) {
      if (cancelRef.current) break;

      // Mark as running
      updated[i] = { ...updated[i], status: "running" };
      setRows([...updated]);

      try {
        const result = await scoreRow(updated[i].raw);
        updated[i] = {
          ...updated[i],
          riskScore: result.riskScore,
          verdict:   scoreToVerdict(result.riskScore),
          model1:    result.m1,
          model2:    result.m2,
          model3:    result.m3,
          status:    "done",
        };
      } catch {
        updated[i] = { ...updated[i], status: "error", error: "Score failed" };
      }

      setRows([...updated]);
      setProgress(Math.round(((i + 1) / updated.length) * 100));
    }

    // Summary
    const finished = updated.filter((r) => r.status === "done");
    const fraud = finished.filter((r) => r.verdict === "FRAUD").length;
    const sus   = finished.filter((r) => r.verdict === "SUSPICIOUS").length;
    const safe  = finished.filter((r) => r.verdict === "SAFE").length;
    const avg   = finished.length > 0 ? Math.round(finished.reduce((s, r) => s + (r.riskScore ?? 0), 0) / finished.length) : 0;

    setSummary({ total: finished.length, fraud, suspicious: sus, safe, avgScore: avg, runTimeMs: Date.now() - start });
    setRunning(false);
    setDone(true);
  }, [rows, running]);

  function cancel() { cancelRef.current = true; }

  function downloadCSV() {
    const content = toCSV(rows);
    const blob = new Blob([content], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "fraudshield_batch_results.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setRows([]); setDone(false); setSummary(null); setFileName(null); setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const doneCount    = rows.filter((r) => r.status === "done").length;

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/20 flex items-center justify-center">
              <Upload className="w-4 h-4 text-[#00FF41]" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#00FF41]">Agency Suite</p>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Batch Investigation</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-mono ml-12">
            Upload a CSV of transactions — all 3 models score every row in sequence. Download results for forensics.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: upload + controls */}
          <div className="space-y-5">

            {/* Drop zone */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-[#0052FF]/60 bg-[#0052FF]/5"
                    : "border-white/10 hover:border-white/20 hover:bg-white/2"
                }`}>
                <Upload className={`w-8 h-8 mx-auto mb-3 ${dragOver ? "text-[#0052FF]" : "text-gray-700"}`} />
                <p className="text-sm font-mono text-gray-400">Drop CSV here</p>
                <p className="text-[10px] font-mono text-gray-700 mt-1">or click to browse · max 500 rows</p>
                {fileName && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#00FF41]" />
                    <span className="text-xs font-mono text-[#00FF41]">{fileName}</span>
                    <span className="text-[10px] font-mono text-gray-700">({rows.length} rows)</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              </div>
            </motion.div>

            {/* Sample + controls */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Actions</p>
              <button onClick={loadSample}
                className="w-full flex items-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-400 hover:text-white transition-all">
                <FileText className="w-4 h-4 ml-3" /> Load Sample CSV (8 transactions)
              </button>
              <button onClick={runBatch}
                disabled={rows.length === 0 || running}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0052FF] hover:bg-[#3378FF] disabled:opacity-30 text-white text-sm font-mono font-semibold transition-all shadow-blue-glow">
                <Play className="w-4 h-4" /> {running ? `Scoring ${doneCount}/${rows.length}...` : "Run Batch Analysis"}
              </button>
              {running && (
                <button onClick={cancel}
                  className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[#FF3131] hover:bg-[#FF3131]/10 transition-all">
                  Cancel
                </button>
              )}
              {done && (
                <>
                  <button onClick={downloadCSV}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/20 text-xs font-mono text-[#00FF41] hover:bg-[#00FF41]/20 transition-all">
                    <Download className="w-3.5 h-3.5" /> Download Results CSV
                  </button>
                  <button onClick={reset}
                    className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-600 hover:text-gray-400 transition-all">
                    <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" />Reset
                  </button>
                </>
              )}
            </motion.div>

            {/* Progress */}
            {(running || done) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Progress</p>
                  <span className="text-xs font-mono text-white font-bold">{progress}%</span>
                </div>
                <ProgressBar pct={progress} color="#0052FF" />
                <p className="text-[10px] font-mono text-gray-700">{doneCount} / {rows.length} transactions scored</p>
              </motion.div>
            )}

            {/* Summary stats */}
            {summary && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5 space-y-3">
                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Summary</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-xl bg-[#FF3131]/8 border border-[#FF3131]/15">
                    <p className="text-2xl font-bold font-mono text-[#FF3131]">{summary.fraud}</p>
                    <p className="text-[9px] font-mono text-gray-600">FRAUD</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-[#FFB800]/8 border border-[#FFB800]/15">
                    <p className="text-2xl font-bold font-mono text-[#FFB800]">{summary.suspicious}</p>
                    <p className="text-[9px] font-mono text-gray-600">SUSPICIOUS</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-[#00FF41]/8 border border-[#00FF41]/15">
                    <p className="text-2xl font-bold font-mono text-[#00FF41]">{summary.safe}</p>
                    <p className="text-[9px] font-mono text-gray-600">SAFE</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-[#0052FF]/8 border border-[#0052FF]/15">
                    <p className="text-2xl font-bold font-mono text-[#0052FF]">{summary.avgScore}</p>
                    <p className="text-[9px] font-mono text-gray-600">AVG RISK</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-gray-700">
                  <Clock className="w-3 h-3" />{(summary.runTimeMs / 1000).toFixed(1)}s total runtime
                </div>
              </motion.div>
            )}

            {/* CSV format guide */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-5">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">CSV Format</p>
              <p className="text-[10px] font-mono text-gray-500 mb-2">Required column (any one):</p>
              <code className="text-[10px] font-mono text-[#00FF41] block">TransactionAmt</code>
              <p className="text-[10px] font-mono text-gray-500 mt-2 mb-1">Optional enrichment columns:</p>
              <code className="text-[9px] font-mono text-gray-600 block leading-relaxed">
                V1, V2, V4, V14, hour, card4,<br />ProductCD, user_amt_mean,<br />time_since_last_min, user_avg_hour,<br />user_tx_count
              </code>
            </motion.div>
          </div>

          {/* Right: results table */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-80 text-center">
                  <Upload className="w-12 h-12 text-gray-800 mb-4" />
                  <p className="text-gray-700 font-mono text-sm">Upload a CSV or load the sample data</p>
                  <p className="text-gray-800 font-mono text-xs mt-1">Results will appear here</p>
                </div>
              ) : (
                <div className="glass-card rounded-2xl overflow-hidden">
                  {/* Table header */}
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <p className="text-xs font-mono text-gray-500">{rows.length} transactions loaded</p>
                    {done && (
                      <p className="text-[10px] font-mono text-[#00FF41] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Analysis complete
                      </p>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] font-mono">
                      <thead>
                        <tr className="border-b border-white/5">
                          {["#", "TXN Amount", "Risk Score", "Verdict", "M1", "M2", "M3", "Status"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-mono text-gray-700 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {rows.map((row) => (
                            <motion.tr
                              key={row.index}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`border-b border-white/5 transition-all ${
                                row.status === "running" ? "bg-[#0052FF]/5" : "hover:bg-white/2"
                              }`}>
                              <td className="px-4 py-2.5 text-gray-700">{row.index}</td>
                              <td className="px-4 py-2.5 text-gray-300 whitespace-nowrap">
                                ${parseFloat(row.raw["TransactionAmt"] ?? row.raw["amount"] ?? "0").toFixed(2)}
                              </td>
                              <td className="px-4 py-2.5">
                                {row.riskScore !== undefined ? (
                                  <span className="font-bold" style={{ color: row.riskScore >= 70 ? "#FF3131" : row.riskScore >= 35 ? "#FFB800" : "#00FF41" }}>
                                    {row.riskScore}
                                  </span>
                                ) : "—"}
                              </td>
                              <td className="px-4 py-2.5">
                                {row.verdict ? <VerdictBadge verdict={row.verdict} /> : "—"}
                              </td>
                              <td className="px-4 py-2.5 text-gray-500">{row.model1 ?? "—"}</td>
                              <td className="px-4 py-2.5 text-gray-500">{row.model2 ?? "—"}</td>
                              <td className="px-4 py-2.5 text-gray-500">{row.model3 ?? "—"}</td>
                              <td className="px-4 py-2.5">
                                {row.status === "running" && (
                                  <span className="text-[#0052FF] animate-pulse flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-ping" />
                                    Scoring
                                  </span>
                                )}
                                {row.status === "done" && (
                                  <CheckCircle className="w-3.5 h-3.5 text-[#00FF41]" />
                                )}
                                {row.status === "error" && (
                                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF3131]" />
                                )}
                                {row.status === "pending" && (
                                  <span className="text-gray-700">Pending</span>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
