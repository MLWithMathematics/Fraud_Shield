"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Bell, Play, Pause, Filter, CheckCheck, FolderPlus,
  Zap, AlertTriangle, ShieldAlert, ShieldCheck, Shield,
  TrendingUp, Clock, Globe, CreditCard, ChevronDown, ChevronUp,
  RefreshCw, X,
} from "lucide-react";
import {
  Alert, AlertSeverity, AlertVerdict,
  getAlerts, addAlert, acknowledgeAlert, linkAlertToCase,
  addCase, getCases, generateMockAlert, genId, scoreToSeverity,
} from "@/lib/caseStore";

// ── Constants ────────────────────────────────────────────────────
const SEV_META: Record<AlertSeverity, { color: string; bg: string; icon: typeof ShieldAlert }> = {
  CRITICAL: { color: "#FF3131", bg: "rgba(255,49,49,0.12)",   icon: ShieldAlert   },
  HIGH:     { color: "#FF8C00", bg: "rgba(255,140,0,0.12)",   icon: AlertTriangle },
  MEDIUM:   { color: "#FFB800", bg: "rgba(255,184,0,0.10)",   icon: Zap           },
  LOW:      { color: "#00FF41", bg: "rgba(0,255,65,0.10)",    icon: ShieldCheck   },
};
const VERDICT_META: Record<AlertVerdict, { color: string; label: string }> = {
  FRAUD:      { color: "#FF3131", label: "FRAUD"      },
  SUSPICIOUS: { color: "#FFB800", label: "SUSPICIOUS" },
  SAFE:       { color: "#00FF41", label: "SAFE"       },
};

// ── Stat card ────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold font-mono" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-gray-700 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Score bar ─────────────────────────────────────────────────────
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-gray-600 w-6">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono w-6 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

// ── Alert Row ────────────────────────────────────────────────────
function AlertRow({ alert, onAck, onCreateCase, caseExists }: {
  alert: Alert;
  onAck: (id: string) => void;
  onCreateCase: (alert: Alert) => void;
  caseExists: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const sev  = SEV_META[alert.severity];
  const verd = VERDICT_META[alert.verdict];
  const SevIcon = sev.icon;
  const age = Math.round((Date.now() - alert.timestamp) / 1000);
  const ageLabel = age < 60 ? `${age}s ago` : age < 3600 ? `${Math.floor(age / 60)}m ago` : `${Math.floor(age / 3600)}h ago`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className={`rounded-xl border overflow-hidden transition-all ${
        alert.acknowledged ? "opacity-40" : ""
      }`}
      style={{ borderColor: `${sev.color}20`, backgroundColor: `${sev.color}04` }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Severity icon */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: sev.bg, border: `1px solid ${sev.color}25` }}>
          <SevIcon className="w-4 h-4" style={{ color: sev.color }} />
        </div>

        {/* TXN + amount */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-white font-semibold">{alert.transactionId}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${verd.color}15`, color: verd.color }}>
              {verd.label}
            </span>
            {alert.caseId && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0052FF]/15 text-[#3378FF]">
                CASE OPEN
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] font-mono text-gray-400">${alert.amount.toFixed(2)}</span>
            {alert.country && (
              <span className="text-[10px] font-mono text-gray-600 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" />{alert.country}
              </span>
            )}
            {alert.cardNetwork && (
              <span className="text-[10px] font-mono text-gray-600 flex items-center gap-1">
                <CreditCard className="w-2.5 h-2.5" />{alert.cardNetwork}
              </span>
            )}
          </div>
        </div>

        {/* Risk score */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold font-mono" style={{ color: sev.color }}>{alert.riskScore}</p>
          <p className="text-[10px] font-mono text-gray-700">RISK</p>
        </div>

        {/* Severity badge */}
        <div className="hidden sm:block flex-shrink-0">
          <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg"
            style={{ backgroundColor: sev.bg, color: sev.color }}>{alert.severity}</span>
        </div>

        {/* Time */}
        <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-gray-700 flex-shrink-0">
          <Clock className="w-3 h-3" />{ageLabel}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!alert.acknowledged && (
            <button onClick={() => onAck(alert.id)}
              title="Acknowledge"
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors text-gray-500 hover:text-[#00FF41]">
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
          {!caseExists && !alert.caseId && (
            <button onClick={() => onCreateCase(alert)}
              title="Open Case"
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0052FF]/10 hover:bg-[#0052FF]/20 transition-colors text-[#3378FF]">
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => setExpanded((e) => !e)}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors text-gray-600">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded: model scores */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="px-4 pb-3 pt-1 border-t border-white/5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-mono text-gray-700 mb-1.5">MODEL SCORES</p>
                  <div className="space-y-1.5">
                    <ScoreBar label="M1" score={alert.model1Score} color="#0052FF" />
                    <ScoreBar label="M2" score={alert.model2Score} color="#00FF41" />
                    <ScoreBar label="M3" score={alert.model3Score} color="#A855F7" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-gray-700 mb-1.5">TRANSACTION</p>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-mono text-gray-500">Amount: <span className="text-white">${alert.amount.toFixed(2)}</span></p>
                    <p className="text-[10px] font-mono text-gray-500">Country: <span className="text-white">{alert.country || "—"}</span></p>
                    <p className="text-[10px] font-mono text-gray-500">Card: <span className="text-white">{alert.cardNetwork || "—"}</span></p>
                    <p className="text-[10px] font-mono text-gray-500">Hour: <span className="text-white">{alert.hour ?? "—"}:00</span></p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-gray-700 mb-1.5">ACTIONS</p>
                  <div className="space-y-1.5">
                    {!alert.acknowledged && (
                      <button onClick={() => onAck(alert.id)}
                        className="flex items-center gap-1.5 text-[10px] font-mono text-[#00FF41] hover:text-green-300 transition-colors">
                        <CheckCheck className="w-3 h-3" /> Acknowledge alert
                      </button>
                    )}
                    {!alert.caseId && (
                      <button onClick={() => onCreateCase(alert)}
                        className="flex items-center gap-1.5 text-[10px] font-mono text-[#3378FF] hover:text-blue-300 transition-colors">
                        <FolderPlus className="w-3 h-3" /> Open investigation case
                      </button>
                    )}
                    {alert.caseId && (
                      <Link href="/cases"
                        className="flex items-center gap-1.5 text-[10px] font-mono text-[#3378FF] hover:text-blue-300 transition-colors">
                        <Shield className="w-3 h-3" /> View case →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AlertsPage() {
  const [alerts, setAlerts]     = useState<Alert[]>([]);
  const [live, setLive]         = useState(true);
  const [filterSev, setFilterSev] = useState<AlertSeverity | "ALL">("ALL");
  const [filterVerd, setFilterVerd] = useState<AlertVerdict | "ALL">("ALL");
  const [showAcked, setShowAcked]   = useState(false);
  const [toast, setToast]           = useState<string | null>(null);
  const [caseIds, setCaseIds]       = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reload = useCallback(() => {
    setAlerts(getAlerts());
    const cases = getCases();
    setCaseIds(new Set(cases.map((c) => c.alertId)));
  }, []);

  useEffect(() => {
    // Seed with some initial alerts if empty
    const existing = getAlerts();
    if (existing.length === 0) {
      for (let i = 0; i < 12; i++) {
        const a = generateMockAlert();
        a.timestamp -= (12 - i) * 8000;
        addAlert(a);
      }
    }
    reload();
  }, [reload]);

  // Live stream
  useEffect(() => {
    if (live) {
      intervalRef.current = setInterval(() => {
        addAlert(generateMockAlert());
        reload();
      }, 3500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [live, reload]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleAck(id: string) {
    acknowledgeAlert(id);
    reload();
    showToast("Alert acknowledged");
  }

  function handleCreateCase(alert: Alert) {
    const caseId = genId("case");
    addCase({
      id: caseId,
      alertId: alert.id,
      transactionId: alert.transactionId,
      amount: alert.amount,
      riskScore: alert.riskScore,
      status: "OPEN",
      priority: alert.severity as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      assignedTo: "Analyst-1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      notes: [],
      tags: [alert.verdict, alert.severity],
    });
    linkAlertToCase(alert.id, caseId);
    acknowledgeAlert(alert.id);
    reload();
    showToast(`Case opened → ${alert.transactionId}`);
  }

  // Derived
  const filtered = alerts.filter((a) => {
    if (!showAcked && a.acknowledged) return false;
    if (filterSev  !== "ALL" && a.severity !== filterSev)  return false;
    if (filterVerd !== "ALL" && a.verdict  !== filterVerd) return false;
    return true;
  });

  const unread    = alerts.filter((a) => !a.acknowledged).length;
  const critical  = alerts.filter((a) => a.severity === "CRITICAL").length;
  const fraudCount = alerts.filter((a) => a.verdict === "FRAUD").length;
  const fraudRate = alerts.length > 0 ? ((fraudCount / alerts.length) * 100).toFixed(1) : "0.0";

  const SEV_FILTERS: Array<AlertSeverity | "ALL"> = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const VERD_FILTERS: Array<AlertVerdict | "ALL"> = ["ALL", "FRAUD", "SUSPICIOUS", "SAFE"];

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FF3131]/10 border border-[#FF3131]/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#FF3131]" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#FF3131]">Agency Suite</p>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                Live Alert Queue
              </h1>
            </div>
            {unread > 0 && (
              <span className="ml-2 px-2.5 py-1 rounded-full bg-[#FF3131] text-white text-xs font-mono font-bold animate-pulse">
                {unread} LIVE
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 font-mono ml-12">
            Real-time transaction alerts scored by all 3 models — acknowledge, escalate, or open a case.
          </p>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Alerts"   value={alerts.length}   color="#0052FF" />
          <StatCard label="Unacknowledged" value={unread}          color="#FF3131" sub="require action" />
          <StatCard label="Critical"       value={critical}        color="#FF3131" sub="highest severity" />
          <StatCard label="Fraud Rate"     value={`${fraudRate}%`} color="#FFB800" sub="of all alerts" />
        </motion.div>

        {/* ── Controls ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-3 mb-6">

          {/* Live toggle */}
          <button onClick={() => setLive((l) => !l)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono font-medium transition-all ${
              live ? "bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41]"
                   : "bg-white/5 border border-white/10 text-gray-500"
            }`}>
            {live ? <><Play className="w-3.5 h-3.5 fill-current" /> LIVE</> : <><Pause className="w-3.5 h-3.5" /> PAUSED</>}
          </button>

          {/* Severity filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-gray-600" />
            {SEV_FILTERS.map((s) => (
              <button key={s} onClick={() => setFilterSev(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all ${
                  filterSev === s ? "bg-white/10 text-white border border-white/15" : "text-gray-600 hover:text-gray-400"
                }`}
                style={filterSev === s && s !== "ALL" ? { color: SEV_META[s as AlertSeverity]?.color } : {}}>
                {s}
              </button>
            ))}
          </div>

          {/* Verdict filter */}
          <div className="flex items-center gap-1 ml-2">
            {VERD_FILTERS.map((v) => (
              <button key={v} onClick={() => setFilterVerd(v)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all ${
                  filterVerd === v ? "bg-white/10 text-white border border-white/15" : "text-gray-600 hover:text-gray-400"
                }`}>
                {v}
              </button>
            ))}
          </div>

          {/* Show acknowledged */}
          <button onClick={() => setShowAcked((s) => !s)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
              showAcked ? "bg-white/8 text-gray-400" : "text-gray-600 hover:text-gray-400"
            }`}>
            <CheckCheck className="w-3 h-3" /> Show acknowledged
          </button>

          {/* Refresh */}
          <button onClick={reload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono text-gray-600 hover:text-gray-400 transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </motion.div>

        {/* ── Alert list ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 text-gray-700 font-mono text-sm">
                No alerts match current filters
              </motion.div>
            ) : (
              filtered.slice(0, 60).map((alert) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  onAck={handleAck}
                  onCreateCase={handleCreateCase}
                  caseExists={caseIds.has(alert.id)}
                />
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {filtered.length > 60 && (
          <p className="text-center text-[11px] font-mono text-gray-700 mt-4">
            Showing 60 of {filtered.length} alerts — use filters to narrow
          </p>
        )}
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#111] border border-white/10 text-sm font-mono text-white shadow-2xl z-50">
            <CheckCheck className="w-4 h-4 text-[#00FF41]" />
            {toast}
            <button onClick={() => setToast(null)} className="ml-2 text-gray-600 hover:text-gray-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
