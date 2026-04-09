"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Folder, Plus, Filter, Search, Shield, Clock, User,
  MessageSquare, CheckCheck, X, ChevronRight, Tag,
  AlertTriangle, ShieldAlert, ShieldCheck, Zap,
  Send, ThumbsUp, ThumbsDown, BarChart3,
} from "lucide-react";
import {
  Case, CaseStatus, CasePriority, FeedbackLabel, AlertVerdict,
  getCases, updateCase, addCaseNote, addFeedback, getAlerts,
  genId, getFeedback,
} from "@/lib/caseStore";

// ── Visual helpers ────────────────────────────────────────────────
const STATUS_META: Record<CaseStatus, { color: string; bg: string; label: string }> = {
  OPEN:          { color: "#FF3131", bg: "rgba(255,49,49,0.12)",  label: "Open"          },
  INVESTIGATING: { color: "#FFB800", bg: "rgba(255,184,0,0.10)",  label: "Investigating" },
  RESOLVED:      { color: "#00FF41", bg: "rgba(0,255,65,0.10)",   label: "Resolved"      },
  CLOSED:        { color: "#555",    bg: "rgba(85,85,85,0.10)",   label: "Closed"        },
};
const PRIORITY_META: Record<CasePriority, { color: string }> = {
  CRITICAL: { color: "#FF3131" },
  HIGH:     { color: "#FF8C00" },
  MEDIUM:   { color: "#FFB800" },
  LOW:      { color: "#00FF41" },
};
const FEEDBACK_OPTIONS: Array<{ label: string; value: FeedbackLabel; icon: typeof ThumbsUp; color: string }> = [
  { label: "True Positive",  value: "TRUE_POSITIVE",  icon: ThumbsUp,   color: "#00FF41" },
  { label: "False Positive", value: "FALSE_POSITIVE", icon: ThumbsDown, color: "#FF8C00" },
  { label: "True Negative",  value: "TRUE_NEGATIVE",  icon: ShieldCheck, color: "#0052FF" },
  { label: "False Negative", value: "FALSE_NEGATIVE", icon: AlertTriangle, color: "#FF3131" },
];
const ANALYSTS = ["Analyst-1", "Analyst-2", "Analyst-3", "Senior Analyst", "Team Lead"];
const STATUS_OPTIONS: CaseStatus[]  = ["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"];
const PRIORITY_OPTIONS: CasePriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

// ── Case Detail Modal ─────────────────────────────────────────────
function CaseModal({ c, onClose, onUpdate }: { c: Case; onClose: () => void; onUpdate: () => void }) {
  const [noteText, setNoteText]     = useState("");
  const [status, setStatus]         = useState(c.status);
  const [priority, setPriority]     = useState(c.priority);
  const [assignee, setAssignee]     = useState(c.assignedTo);
  const [feedback, setFeedback]     = useState<FeedbackLabel | null>(c.verdict ?? null);
  const [saved, setSaved]           = useState(false);
  const [fbSaved, setFbSaved]       = useState(!!c.verdict);

  const alerts = getAlerts();
  const alert  = alerts.find((a) => a.id === c.alertId);

  function saveChanges() {
    updateCase(c.id, { status, priority, assignedTo: assignee });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdate();
  }

  function submitNote() {
    if (!noteText.trim()) return;
    addCaseNote(c.id, {
      id:        genId("note"),
      timestamp: Date.now(),
      analyst:   assignee,
      text:      noteText.trim(),
    });
    setNoteText("");
    onUpdate();
  }

  function submitFeedback(label: FeedbackLabel) {
    setFeedback(label);
    updateCase(c.id, { verdict: label, status: "RESOLVED" });
    setStatus("RESOLVED");
    addFeedback({
      id:               genId("fb"),
      alertId:          c.alertId,
      modelId:          "combined",
      predictedVerdict: (alert?.verdict ?? "SUSPICIOUS") as AlertVerdict,
      actualLabel:      label,
      riskScore:        c.riskScore,
      timestamp:        Date.now(),
      analyst:          assignee,
    });
    setFbSaved(true);
    onUpdate();
  }

  const latestCase = getCases().find((x) => x.id === c.id) ?? c;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Investigation Case</p>
            <h2 className="text-lg font-bold text-white font-mono">{latestCase.transactionId}</h2>
            <p className="text-xs font-mono text-gray-600 mt-0.5">Case ID: {c.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Left: info + controls */}
          <div className="space-y-5">
            {/* Transaction snapshot */}
            <div className="glass-card rounded-xl p-4">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">Transaction</p>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[11px] font-mono text-gray-500">Amount</span>
                  <span className="text-[11px] font-mono text-white">${latestCase.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] font-mono text-gray-500">Risk Score</span>
                  <span className="text-[11px] font-mono font-bold"
                    style={{ color: latestCase.riskScore >= 70 ? "#FF3131" : latestCase.riskScore >= 35 ? "#FFB800" : "#00FF41" }}>
                    {latestCase.riskScore} / 100
                  </span>
                </div>
                {alert && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[11px] font-mono text-gray-500">Model Verdict</span>
                      <span className="text-[11px] font-mono" style={{ color: alert.verdict === "FRAUD" ? "#FF3131" : "#FFB800" }}>
                        {alert.verdict}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[11px] font-mono text-gray-500">Country</span>
                      <span className="text-[11px] font-mono text-white">{alert.country ?? "—"}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-[11px] font-mono text-gray-500">Created</span>
                  <span className="text-[11px] font-mono text-white">{new Date(latestCase.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Case controls */}
            <div className="glass-card rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Case Controls</p>
              <div>
                <label className="text-[10px] font-mono text-gray-600 block mb-1">STATUS</label>
                <div className="grid grid-cols-2 gap-1">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s} onClick={() => setStatus(s)}
                      className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all"
                      style={status === s
                        ? { backgroundColor: STATUS_META[s].bg, color: STATUS_META[s].color, border: `1px solid ${STATUS_META[s].color}30` }
                        : { backgroundColor: "rgba(255,255,255,0.04)", color: "#555", border: "1px solid transparent" }}>
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-gray-600 block mb-1">PRIORITY</label>
                <div className="grid grid-cols-2 gap-1">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button key={p} onClick={() => setPriority(p)}
                      className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all"
                      style={priority === p
                        ? { backgroundColor: `${PRIORITY_META[p].color}12`, color: PRIORITY_META[p].color, border: `1px solid ${PRIORITY_META[p].color}30` }
                        : { backgroundColor: "rgba(255,255,255,0.04)", color: "#555", border: "1px solid transparent" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-gray-600 block mb-1">ASSIGNED TO</label>
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0052FF]/50">
                  {ANALYSTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <button onClick={saveChanges}
                className="w-full py-2 rounded-xl bg-[#0052FF]/10 border border-[#0052FF]/25 text-xs font-mono text-[#3378FF] hover:bg-[#0052FF]/20 transition-all">
                {saved ? "✓ Saved" : "Save Changes"}
              </button>
            </div>

            {/* Feedback loop */}
            <div className="glass-card rounded-xl p-4">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">
                Analyst Verdict — Feedback Loop
              </p>
              <p className="text-[10px] font-mono text-gray-700 mb-3">
                Was the model prediction correct? This trains the system.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {FEEDBACK_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button key={opt.value} onClick={() => submitFeedback(opt.value)}
                      disabled={fbSaved}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-mono transition-all disabled:opacity-50"
                      style={feedback === opt.value
                        ? { backgroundColor: `${opt.color}15`, color: opt.color, border: `1px solid ${opt.color}30` }
                        : { backgroundColor: "rgba(255,255,255,0.04)", color: "#666", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <Icon className="w-3 h-3" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {fbSaved && feedback && (
                <p className="text-[10px] font-mono text-[#00FF41] mt-2 text-center">
                  ✓ Verdict submitted — contributes to model metrics
                </p>
              )}
            </div>
          </div>

          {/* Right: notes timeline */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">Investigation Notes</p>
              {/* Add note */}
              <div className="mb-4">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add investigation note, evidence, or finding..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-gray-300 placeholder-gray-700 focus:outline-none focus:border-[#0052FF]/50 resize-none"
                />
                <button onClick={submitNote}
                  disabled={!noteText.trim()}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#0052FF] hover:bg-[#3378FF] disabled:opacity-30 text-white text-xs font-mono font-semibold transition-all">
                  <Send className="w-3 h-3" /> Add Note
                </button>
              </div>

              {/* Notes list */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {latestCase.notes.length === 0 ? (
                  <div className="text-center py-8 text-gray-700 font-mono text-xs">No notes yet</div>
                ) : (
                  [...latestCase.notes].reverse().map((note) => (
                    <div key={note.id} className="glass-card rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/30 flex items-center justify-center">
                          <User className="w-2.5 h-2.5 text-[#0052FF]" />
                        </div>
                        <span className="text-[10px] font-mono text-[#3378FF]">{note.analyst}</span>
                        <span className="text-[10px] font-mono text-gray-700 ml-auto">
                          {new Date(note.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-gray-300 leading-relaxed pl-7">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {latestCase.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-[10px] font-mono text-gray-500 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Case Row ──────────────────────────────────────────────────────
function CaseRow({ c, onClick }: { c: Case; onClick: () => void }) {
  const sm = STATUS_META[c.status];
  const pm = PRIORITY_META[c.priority];
  const age = Math.round((Date.now() - c.createdAt) / 60000);
  const ageLabel = age < 60 ? `${age}m` : `${Math.floor(age / 60)}h`;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full text-left glass-card rounded-xl px-5 py-4 hover:border-[#0052FF]/25 transition-all group"
      style={{ border: `1px solid rgba(255,255,255,0.06)` }}>
      <div className="flex items-center gap-4">
        {/* Priority dot */}
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: pm.color }} />

        {/* TXN */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono text-white font-semibold">{c.transactionId}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{ backgroundColor: sm.bg, color: sm.color }}>{sm.label}</span>
            {c.verdict && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00FF41]/10 text-[#00FF41]">
                {c.verdict.replace("_", " ")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-0.5">
            <span className="text-xs font-mono text-gray-500">${c.amount.toFixed(2)}</span>
            <span className="text-[10px] font-mono text-gray-700 flex items-center gap-1">
              <User className="w-2.5 h-2.5" />{c.assignedTo}
            </span>
            <span className="text-[10px] font-mono text-gray-700 flex items-center gap-1">
              <MessageSquare className="w-2.5 h-2.5" />{c.notes.length}
            </span>
          </div>
        </div>

        {/* Risk score */}
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold font-mono"
            style={{ color: c.riskScore >= 70 ? "#FF3131" : c.riskScore >= 35 ? "#FFB800" : "#00FF41" }}>
            {c.riskScore}
          </p>
          <p className="text-[9px] font-mono text-gray-700">RISK</p>
        </div>

        {/* Priority */}
        <span className="hidden sm:block text-[10px] font-mono font-bold px-2 py-1 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${pm.color}10`, color: pm.color }}>
          {c.priority}
        </span>

        {/* Age */}
        <span className="hidden md:flex items-center gap-1 text-[10px] font-mono text-gray-700 flex-shrink-0">
          <Clock className="w-3 h-3" />{ageLabel}
        </span>

        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" />
      </div>
    </motion.button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function CasesPage() {
  const [cases, setCases]         = useState<Case[]>([]);
  const [selected, setSelected]   = useState<Case | null>(null);
  const [filterStatus, setFilterStatus] = useState<CaseStatus | "ALL">("ALL");
  const [filterPrio, setFilterPrio]     = useState<CasePriority | "ALL">("ALL");
  const [search, setSearch]             = useState("");
  const [fbCount, setFbCount]           = useState(0);

  const reload = useCallback(() => {
    setCases(getCases());
    setFbCount(getFeedback().length);
    if (selected) {
      const refreshed = getCases().find((c) => c.id === selected.id);
      if (refreshed) setSelected(refreshed);
    }
  }, [selected]);

  useEffect(() => { reload(); }, [reload]);

  // Derived stats
  const open    = cases.filter((c) => c.status === "OPEN").length;
  const invest  = cases.filter((c) => c.status === "INVESTIGATING").length;
  const resolved = cases.filter((c) => c.status === "RESOLVED").length;

  const filtered = cases.filter((c) => {
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    if (filterPrio   !== "ALL" && c.priority !== filterPrio) return false;
    if (search && !c.transactionId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const STATUS_FILTERS: Array<CaseStatus | "ALL"> = ["ALL", "OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"];
  const PRIO_FILTERS: Array<CasePriority | "ALL"> = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#0052FF]/10 border border-[#0052FF]/20 flex items-center justify-center">
              <Folder className="w-4 h-4 text-[#0052FF]" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#0052FF]">Agency Suite</p>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Case Management</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-mono ml-12">
            Full investigation lifecycle — open, assign, document, and resolve fraud cases with analyst feedback.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,transparent,#FF3131,transparent)" }} />
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1">Open</p>
            <p className="text-3xl font-bold font-mono text-[#FF3131]">{open}</p>
          </div>
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,transparent,#FFB800,transparent)" }} />
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1">Investigating</p>
            <p className="text-3xl font-bold font-mono text-[#FFB800]">{invest}</p>
          </div>
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,transparent,#00FF41,transparent)" }} />
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1">Resolved</p>
            <p className="text-3xl font-bold font-mono text-[#00FF41]">{resolved}</p>
          </div>
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,transparent,#A855F7,transparent)" }} />
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1">Feedback Entries</p>
            <p className="text-3xl font-bold font-mono text-[#A855F7]">{fbCount}</p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-3 mb-6">

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex-1 min-w-48 max-w-64">
            <Search className="w-3.5 h-3.5 text-gray-600" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search TXN ID..."
              className="bg-transparent text-xs font-mono text-gray-300 placeholder-gray-700 focus:outline-none flex-1"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-gray-600" />
            {STATUS_FILTERS.map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                  filterStatus === s ? "bg-white/10 text-white border border-white/15" : "text-gray-600 hover:text-gray-400"
                }`}>
                {s === "ALL" ? "All" : STATUS_META[s as CaseStatus]?.label ?? s}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1 ml-2">
            {PRIO_FILTERS.map((p) => (
              <button key={p} onClick={() => setFilterPrio(p)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                  filterPrio === p ? "bg-white/10 text-white border border-white/15" : "text-gray-600 hover:text-gray-400"
                }`}>
                {p}
              </button>
            ))}
          </div>

          {/* Go to alerts */}
          <Link href="/alerts"
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF3131]/10 border border-[#FF3131]/20 text-xs font-mono text-[#FF3131] hover:bg-[#FF3131]/20 transition-all">
            <Plus className="w-3.5 h-3.5" /> Open from Alert Queue
          </Link>
        </motion.div>

        {/* Cases list */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Folder className="w-10 h-10 text-gray-800 mx-auto mb-4" />
              <p className="text-gray-700 font-mono text-sm">No cases found</p>
              <Link href="/alerts" className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-[#0052FF] hover:text-[#3378FF] transition-colors">
                Go to Alert Queue to open cases <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            filtered.map((c) => (
              <CaseRow key={c.id} c={c} onClick={() => setSelected(c)} />
            ))
          )}
        </motion.div>

        {/* Performance link */}
        {fbCount >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-8 p-4 glass-card rounded-2xl flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-[#A855F7]" />
            <div className="flex-1">
              <p className="text-sm font-mono text-white">{fbCount} feedback entries collected</p>
              <p className="text-[10px] font-mono text-gray-600">View how they affect model metrics in Performance dashboard</p>
            </div>
            <Link href="/performance"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/20 text-xs font-mono text-[#A855F7] hover:bg-[#A855F7]/20 transition-all">
              View Performance <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Case modal */}
      <AnimatePresence>
        {selected && (
          <CaseModal
            c={selected}
            onClose={() => { setSelected(null); reload(); }}
            onUpdate={reload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
