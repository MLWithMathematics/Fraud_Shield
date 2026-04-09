"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Target, RefreshCw,
  ThumbsUp, ThumbsDown, AlertTriangle, Shield,
  Activity, Zap, BrainCircuit,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  AreaChart, Area, CartesianGrid,
} from "recharts";
import { getFeedback, FeedbackEntry } from "@/lib/caseStore";

// ── Static baseline metrics (from training) ──────────────────────
const BASELINE: Record<string, { precision: number; recall: number; f1: number; auc: number; name: string; color: string; icon: typeof Shield }> = {
  "transaction-classifier": {
    name: "TransactionGuard", color: "#0052FF", icon: Shield,
    precision: 0.91, recall: 0.88, f1: 0.895, auc: 0.950,
  },
  "anomaly-detector": {
    name: "AnomalyNet", color: "#00FF41", icon: Activity,
    precision: 0.94, recall: 0.85, f1: 0.893, auc: 0.970,
  },
  "ato-detector": {
    name: "BehaviourGuard", color: "#A855F7", icon: BrainCircuit,
    precision: 0.87, recall: 0.82, f1: 0.844, auc: 0.910,
  },
};

// ── Confusion matrix cell ─────────────────────────────────────────
function CMCell({ value, label, color, sub }: { value: number; label: string; color: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl border"
      style={{ backgroundColor: `${color}08`, borderColor: `${color}20` }}>
      <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
      <p className="text-[10px] font-mono text-gray-500 text-center mt-0.5">{label}</p>
      {sub && <p className="text-[9px] font-mono text-gray-700 text-center">{sub}</p>}
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────
function MetricCard({ label, value, baseline, color, format = "pct" }: {
  label: string; value: number; baseline: number; color: string;
  format?: "pct" | "raw";
}) {
  const diff  = value - baseline;
  const pctVal = format === "pct" ? `${(value * 100).toFixed(1)}%` : value.toFixed(3);
  const sign   = diff >= 0 ? "+" : "";
  const diffStr = `${sign}${(diff * 100).toFixed(1)}pp`;

  return (
    <div className="glass-card rounded-xl p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      <p className="text-[10px] font-mono text-gray-600 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono" style={{ color }}>{pctVal}</p>
      <p className={`text-[10px] font-mono mt-0.5 ${diff >= 0 ? "text-[#00FF41]" : "text-[#FF3131]"}`}>
        {diffStr} vs baseline
      </p>
    </div>
  );
}

// ── Threshold simulator ───────────────────────────────────────────
function ThresholdSimulator({ color }: { color: string }) {
  const [threshold, setThreshold] = useState(50);

  // Simulate how threshold changes affect precision/recall tradeoff
  const precision = Math.min(0.99, 0.70 + (threshold / 100) * 0.28);
  const recall    = Math.max(0.40, 0.98 - (threshold / 100) * 0.55);
  const f1 = (2 * precision * recall) / (precision + recall + 0.001);

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-1">Threshold Simulator</p>
        <p className="text-[10px] font-mono text-gray-700">Drag to see Precision / Recall tradeoff</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-gray-500">Alert threshold</span>
          <span className="font-bold" style={{ color }}>{threshold}</span>
        </div>
        <input type="range" min={10} max={90} value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full accent-blue-500" />
        <div className="flex justify-between text-[9px] font-mono text-gray-700">
          <span>Low — catch more fraud (more FP)</span>
          <span>High — fewer alerts (more FN)</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Precision", value: precision, color: color },
          { label: "Recall",    value: recall,    color: "#FFB800" },
          { label: "F1 Score",  value: f1,        color: "#00FF41" },
        ].map((m) => (
          <div key={m.label} className="text-center p-2 rounded-xl bg-white/3 border border-white/6">
            <p className="text-lg font-bold font-mono" style={{ color: m.color }}>{(m.value * 100).toFixed(0)}%</p>
            <p className="text-[9px] font-mono text-gray-600">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={Array.from({ length: 9 }, (_, i) => {
            const t = 10 + i * 10;
            const p = Math.min(0.99, 0.70 + (t / 100) * 0.28);
            const r = Math.max(0.40, 0.98 - (t / 100) * 0.55);
            return { t, precision: Math.round(p * 100), recall: Math.round(r * 100) };
          })}>
            <XAxis dataKey="t" tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }} />
            <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", fontSize: 10, fontFamily: "monospace" }} />
            <Line type="monotone" dataKey="precision" stroke={color} dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="recall" stroke="#FFB800" dot={false} strokeWidth={2} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Feedback analysis ─────────────────────────────────────────────
function computeMetricsFromFeedback(entries: FeedbackEntry[]) {
  const tp = entries.filter((e) => e.actualLabel === "TRUE_POSITIVE").length;
  const fp = entries.filter((e) => e.actualLabel === "FALSE_POSITIVE").length;
  const tn = entries.filter((e) => e.actualLabel === "TRUE_NEGATIVE").length;
  const fn = entries.filter((e) => e.actualLabel === "FALSE_NEGATIVE").length;
  const precision = tp + fp > 0 ? tp / (tp + fp) : null;
  const recall    = tp + fn > 0 ? tp / (tp + fn) : null;
  const f1 = precision !== null && recall !== null && precision + recall > 0
    ? (2 * precision * recall) / (precision + recall)
    : null;
  return { tp, fp, tn, fn, precision, recall, f1, total: entries.length };
}

// ── Radar chart data ──────────────────────────────────────────────
function radarData(model: { precision: number; recall: number; f1: number; auc: number }) {
  return [
    { metric: "Precision", value: Math.round(model.precision * 100) },
    { metric: "Recall",    value: Math.round(model.recall    * 100) },
    { metric: "F1 Score",  value: Math.round(model.f1        * 100) },
    { metric: "AUC-ROC",   value: Math.round(model.auc       * 100) },
    { metric: "Coverage",  value: Math.round((model.recall * 0.85 + model.precision * 0.15) * 100) },
  ];
}

// ── Main Page ─────────────────────────────────────────────────────
export default function PerformancePage() {
  const [activeModel, setActiveModel] = useState<string>("transaction-classifier");
  const [feedback, setFeedback]       = useState<FeedbackEntry[]>([]);
  const [reloaded, setReloaded]       = useState(0);

  useEffect(() => {
    setFeedback(getFeedback());
  }, [reloaded]);

  const base   = BASELINE[activeModel];
  const fbMeta = computeMetricsFromFeedback(feedback);

  // Adjusted metrics = blend of baseline + feedback
  const adjustedPrecision = fbMeta.precision !== null
    ? base.precision * 0.7 + fbMeta.precision * 0.3
    : base.precision;
  const adjustedRecall = fbMeta.recall !== null
    ? base.recall * 0.7 + fbMeta.recall * 0.3
    : base.recall;
  const adjustedF1 = fbMeta.f1 !== null
    ? base.f1 * 0.7 + fbMeta.f1 * 0.3
    : base.f1;

  // Historical (simulated) AUC drift
  const aucHistory = useMemo(() => [
    { day: "D-6", auc: 94.2 },
    { day: "D-5", auc: 94.8 },
    { day: "D-4", auc: 95.1 },
    { day: "D-3", auc: 94.6 },
    { day: "D-2", auc: 95.3 },
    { day: "D-1", auc: 95.0 },
    { day: "Today", auc: parseFloat((base.auc * 100).toFixed(1)) },
  ], [base.auc]);

  const ModelIcon = base.icon;

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#A855F7]" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#A855F7]">Agency Suite</p>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Model Performance</h1>
            </div>
            <button onClick={() => setReloaded((r) => r + 1)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
          <p className="text-sm text-gray-600 font-mono ml-12">
            Precision, Recall, F1 and AUC per model — updated with analyst feedback from Case Management.
          </p>
        </motion.div>

        {/* Model selector */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-8 flex-wrap">
          {Object.entries(BASELINE).map(([id, m]) => {
            const Icon = m.icon;
            return (
              <button key={id} onClick={() => setActiveModel(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono font-medium transition-all ${
                  activeModel === id ? "text-white border" : "text-gray-500 hover:text-gray-300 border border-transparent"
                }`}
                style={activeModel === id ? {
                  backgroundColor: `${m.color}12`,
                  borderColor: `${m.color}30`,
                  color: m.color,
                } : {}}>
                <Icon className="w-4 h-4" style={{ color: activeModel === id ? m.color : undefined }} />
                {m.name}
              </button>
            );
          })}
        </motion.div>

        {/* Key metrics */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Precision" value={adjustedPrecision} baseline={base.precision} color={base.color} />
          <MetricCard label="Recall"    value={adjustedRecall}    baseline={base.recall}    color="#FFB800" />
          <MetricCard label="F1 Score"  value={adjustedF1}        baseline={base.f1}        color="#00FF41" />
          <MetricCard label="AUC-ROC"   value={base.auc}          baseline={base.auc}       color="#A855F7" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">

          {/* Radar chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5">
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-4">Model Profile</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData({ precision: adjustedPrecision, recall: adjustedRecall, f1: adjustedF1, auc: base.auc })}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#666", fontSize: 9, fontFamily: "monospace" }} />
                  <Radar name={base.name} dataKey="value" stroke={base.color} fill={base.color} fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-2 justify-center mt-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: base.color }} />
              <span className="text-[10px] font-mono text-gray-500">{base.name}</span>
            </div>
          </motion.div>

          {/* AUC drift chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-5">
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-4">AUC-ROC — 7 Day History</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aucHistory}>
                  <defs>
                    <linearGradient id="aucGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={base.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={base.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }} />
                  <YAxis domain={[90, 100]} tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.08)", fontSize: 10, fontFamily: "monospace" }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <Area type="monotone" dataKey="auc" stroke={base.color} fill="url(#aucGrad)" strokeWidth={2} dot={{ fill: base.color, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Threshold simulator */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <ThresholdSimulator color={base.color} />
          </motion.div>
        </div>

        {/* Feedback confusion matrix */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                Confusion Matrix — Analyst Feedback
              </p>
              <span className="text-[10px] font-mono text-gray-700">{feedback.length} entries</span>
            </div>

            {feedback.length === 0 ? (
              <div className="text-center py-10">
                <Target className="w-8 h-8 text-gray-800 mx-auto mb-3" />
                <p className="text-gray-700 font-mono text-xs">No feedback yet</p>
                <p className="text-gray-800 font-mono text-[10px] mt-1">
                  Submit analyst verdicts in Case Management to populate this matrix
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <CMCell value={fbMeta.tp} label="True Positive" color="#00FF41"  sub="Correct fraud flags" />
                  <CMCell value={fbMeta.fp} label="False Positive" color="#FF8C00" sub="Legit flagged as fraud" />
                  <CMCell value={fbMeta.fn} label="False Negative" color="#FF3131" sub="Fraud missed" />
                  <CMCell value={fbMeta.tn} label="True Negative"  color="#0052FF" sub="Correct safe flags" />
                </div>

                {fbMeta.precision !== null && (
                  <div className="space-y-2 mt-4">
                    {[
                      { label: "Precision from feedback", value: fbMeta.precision, color: "#00FF41" },
                      { label: "Recall from feedback",    value: fbMeta.recall!,   color: "#FFB800" },
                      { label: "F1 from feedback",        value: fbMeta.f1!,       color: "#A855F7" },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-gray-600 w-40">{m.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${m.value * 100}%`, backgroundColor: m.color }} />
                        </div>
                        <span className="text-[10px] font-mono font-bold w-12 text-right" style={{ color: m.color }}>
                          {(m.value * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Feedback breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-5">
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-4">
              All-Model Comparison — Baseline
            </p>
            <div className="space-y-5">
              {Object.entries(BASELINE).map(([id, m]) => {
                const Icon = m.icon;
                return (
                  <div key={id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                      <span className="text-xs font-mono font-semibold text-white">{m.name}</span>
                      <span className="ml-auto text-[10px] font-mono font-bold" style={{ color: m.color }}>
                        AUC {(m.auc * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { k: "P",  v: m.precision },
                        { k: "R",  v: m.recall    },
                        { k: "F1", v: m.f1        },
                      ].map((metric) => (
                        <div key={metric.k} className="text-center p-2 rounded-lg bg-white/3 border border-white/5">
                          <p className="text-xs font-bold font-mono" style={{ color: m.color }}>
                            {(metric.v * 100).toFixed(0)}%
                          </p>
                          <p className="text-[9px] font-mono text-gray-700">{metric.k}</p>
                        </div>
                      ))}
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.auc * 100}%`, backgroundColor: m.color, opacity: 0.6 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drift indicator */}
            <div className="mt-6 p-3 rounded-xl bg-white/3 border border-white/6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#00FF41]" />
                <span className="text-[10px] font-mono text-gray-400">Model Health</span>
                <span className="ml-auto text-[10px] font-mono font-bold text-[#00FF41]">STABLE</span>
              </div>
              <p className="text-[10px] font-mono text-gray-700">
                All 3 models within expected performance bounds. Feedback loop collecting analyst verdicts.
                {feedback.length > 0 && ` ${feedback.length} entries ingested.`}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
