"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Plus, Trash2, ToggleLeft, ToggleRight, Play,
  CheckCircle2, AlertTriangle, X, ChevronDown, Settings,
  Shield, Activity, BrainCircuit, GitMerge, Copy,
  Edit3, Save, Info,
} from "lucide-react";
import {
  getRules, createRule, deleteRule, toggleRule, updateRule,
  evaluateRules, seedDemoRules,
} from "@/lib/ruleStore";
import { pushAudit } from "@/lib/auditStore";
import type { FraudRule, RuleCondition, RuleField, RuleOperator, RuleAction, RuleLogic } from "@/lib/types";

// ── Constants ────────────────────────────────────────────────────
const FIELDS: { value: RuleField; label: string; type: "number" | "string" }[] = [
  { value: "combinedScore",  label: "Combined Score (0-100)",    type: "number" },
  { value: "model1Score",    label: "TransactionGuard Score",    type: "number" },
  { value: "model2Score",    label: "AnomalyNet Score",          type: "number" },
  { value: "model3Score",    label: "BehaviourGuard Score",      type: "number" },
  { value: "transactionAmt", label: "Transaction Amount ($)",    type: "number" },
  { value: "verdict",        label: "Verdict",                   type: "string" },
  { value: "riskLevel",      label: "Risk Level",                type: "string" },
];

const NUM_OPERATORS: { value: RuleOperator; label: string }[] = [
  { value: ">",  label: ">" },
  { value: "<",  label: "<" },
  { value: ">=", label: "≥" },
  { value: "<=", label: "≤" },
  { value: "==", label: "=" },
  { value: "!=", label: "≠" },
];

const STR_OPERATORS: { value: RuleOperator; label: string }[] = [
  { value: "==", label: "equals" },
  { value: "!=", label: "not equals" },
];

const STRING_FIELD_OPTIONS: Record<string, string[]> = {
  verdict:   ["FRAUD", "SUSPICIOUS", "SAFE"],
  riskLevel: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
};

const ACTIONS: { value: RuleAction; label: string; color: string; desc: string }[] = [
  { value: "AUTO_BLOCK",  label: "Auto Block",  color: "#FF3131", desc: "Immediately block the transaction" },
  { value: "ESCALATE",    label: "Escalate",    color: "#FF8800", desc: "Escalate case to senior analyst" },
  { value: "FLAG",        label: "Flag",        color: "#FFB800", desc: "Add a review flag without blocking" },
  { value: "CREATE_CASE", label: "Create Case", color: "#0052FF", desc: "Auto-open an investigation case" },
  { value: "ALERT",       label: "Alert",       color: "#A855F7", desc: "Send real-time alert to analysts" },
];

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Condition builder row ────────────────────────────────────────
function ConditionRow({
  cond, index, total, onUpdate, onRemove,
}: {
  cond: RuleCondition;
  index: number;
  total: number;
  onUpdate: (c: RuleCondition) => void;
  onRemove: () => void;
}) {
  const fieldMeta = FIELDS.find((f) => f.value === cond.field);
  const isString = fieldMeta?.type === "string";
  const operators = isString ? STR_OPERATORS : NUM_OPERATORS;
  const strOptions = isString ? (STRING_FIELD_OPTIONS[cond.field] ?? []) : [];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Field */}
      <select
        value={cond.field}
        onChange={(e) => onUpdate({ ...cond, field: e.target.value as RuleField, value: "" })}
        className="bg-[#0f0f0f] border border-white/8 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none focus:border-[#0052FF]/40 flex-1 min-w-[180px]"
      >
        {FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>

      {/* Operator */}
      <select
        value={cond.operator}
        onChange={(e) => onUpdate({ ...cond, operator: e.target.value as RuleOperator })}
        className="bg-[#0f0f0f] border border-white/8 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none focus:border-[#0052FF]/40 w-24"
      >
        {operators.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
      </select>

      {/* Value */}
      {isString && strOptions.length > 0 ? (
        <select
          value={cond.value}
          onChange={(e) => onUpdate({ ...cond, value: e.target.value })}
          className="bg-[#0f0f0f] border border-white/8 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none focus:border-[#0052FF]/40 w-36"
        >
          <option value="">Select…</option>
          {strOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={cond.value}
          onChange={(e) => onUpdate({ ...cond, value: e.target.value })}
          placeholder="value"
          className="bg-[#0f0f0f] border border-white/8 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none focus:border-[#0052FF]/40 w-28"
        />
      )}

      {/* Remove */}
      {total > 1 && (
        <button
          onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-700 hover:text-[#FF3131] hover:bg-[#FF3131]/8 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Rule Editor Modal ────────────────────────────────────────────
function RuleEditorModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: FraudRule;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName]         = useState(initial?.name ?? "");
  const [desc, setDesc]         = useState(initial?.description ?? "");
  const [logic, setLogic]       = useState<RuleLogic>(initial?.logic ?? "AND");
  const [action, setAction]     = useState<RuleAction>(initial?.action ?? "FLAG");
  const [conditions, setConds]  = useState<RuleCondition[]>(
    initial?.conditions ?? [{ id: uid(), field: "combinedScore", operator: ">=", value: "" }]
  );

  const addCond = () =>
    setConds((prev) => [...prev, { id: uid(), field: "combinedScore", operator: ">=", value: "" }]);

  const updateCond = (idx: number, c: RuleCondition) =>
    setConds((prev) => prev.map((x, i) => (i === idx ? c : x)));

  const removeCond = (idx: number) =>
    setConds((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!name.trim() || conditions.some((c) => !c.value)) return;
    if (initial) {
      updateRule(initial.id, { name, description: desc, logic, action, conditions });
      pushAudit("RULE_UPDATED", `Rule '${name}' updated`, { entityId: initial.id, entityType: "rule" });
    } else {
      const rule = createRule({ name, description: desc, logic, conditions, action });
      pushAudit("RULE_CREATED", `Rule '${name}' created`, { entityId: rule.id, entityType: "rule" });
    }
    onSave();
    onClose();
  };

  const selectedAction = ACTIONS.find((a) => a.value === action)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl glass-card rounded-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            {initial ? "Edit Rule" : "New Rule"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Name + description */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-gray-600 uppercase mb-1.5">Rule Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. High-value night fraud"
                className="w-full bg-[#0f0f0f] border border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-300 font-mono placeholder:text-gray-700 focus:outline-none focus:border-[#0052FF]/40"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-600 uppercase mb-1.5">Description</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Brief explanation of this rule"
                className="w-full bg-[#0f0f0f] border border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-300 font-mono placeholder:text-gray-700 focus:outline-none focus:border-[#0052FF]/40"
              />
            </div>
          </div>

          {/* Logic toggle */}
          <div>
            <label className="block text-[10px] font-mono text-gray-600 uppercase mb-2">Condition Logic</label>
            <div className="flex gap-2">
              {(["AND", "OR"] as RuleLogic[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLogic(l)}
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all border"
                  style={
                    logic === l
                      ? { backgroundColor: "rgba(0,82,255,0.15)", borderColor: "rgba(0,82,255,0.4)", color: "#3378FF" }
                      : { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.06)", color: "#6B7280" }
                  }
                >
                  {l}
                </button>
              ))}
              <span className="text-[10px] font-mono text-gray-600 self-center ml-2">
                {logic === "AND" ? "All conditions must match" : "Any condition must match"}
              </span>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-mono text-gray-600 uppercase">Conditions</label>
              <button
                onClick={addCond}
                className="flex items-center gap-1 text-[10px] font-mono text-[#0052FF] hover:text-[#3378FF] transition-colors"
              >
                <Plus className="w-3 h-3" /> Add condition
              </button>
            </div>
            <div className="space-y-2">
              {conditions.map((cond, idx) => (
                <div key={cond.id}>
                  {idx > 0 && (
                    <div className="flex items-center gap-2 my-1.5">
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                        style={{ color: logic === "AND" ? "#0052FF" : "#A855F7", backgroundColor: logic === "AND" ? "rgba(0,82,255,0.1)" : "rgba(168,85,247,0.1)" }}>
                        {logic}
                      </span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>
                  )}
                  <ConditionRow
                    cond={cond}
                    index={idx}
                    total={conditions.length}
                    onUpdate={(c) => updateCond(idx, c)}
                    onRemove={() => removeCond(idx)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <div>
            <label className="block text-[10px] font-mono text-gray-600 uppercase mb-2">Action on Trigger</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {ACTIONS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAction(a.value)}
                  className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-center transition-all"
                  style={
                    action === a.value
                      ? { backgroundColor: `${a.color}12`, borderColor: `${a.color}40`, color: a.color }
                      : { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.06)", color: "#6B7280" }
                  }
                >
                  <span className="text-[11px] font-mono font-bold">{a.label}</span>
                  <span className="text-[9px] font-mono leading-tight opacity-70">{a.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex justify-between items-center flex-shrink-0 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedAction.color }} />
            <span className="text-[10px] font-mono text-gray-500">
              Triggers: <span style={{ color: selectedAction.color }}>{selectedAction.label}</span>
            </span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-mono text-gray-500 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || conditions.some((c) => !c.value)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#3378FF] text-white text-xs font-semibold font-mono transition-all disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5" />
              {initial ? "Update Rule" : "Create Rule"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Rule Test Panel ──────────────────────────────────────────────
function RuleTestPanel({ onRefresh }: { onRefresh: () => void }) {
  const [inputs, setInputs] = useState({
    combinedScore: "85",
    model1Score: "82",
    model2Score: "79",
    model3Score: "91",
    transactionAmt: "3200",
    verdict: "FRAUD",
    riskLevel: "CRITICAL",
  });
  const [results, setResults] = useState<ReturnType<typeof evaluateRules> | null>(null);

  const runTest = () => {
    const parsed = {
      combinedScore:  parseFloat(inputs.combinedScore)  || 0,
      model1Score:    parseFloat(inputs.model1Score)    || 0,
      model2Score:    parseFloat(inputs.model2Score)    || 0,
      model3Score:    parseFloat(inputs.model3Score)    || 0,
      transactionAmt: parseFloat(inputs.transactionAmt) || 0,
      verdict:        inputs.verdict,
      riskLevel:      inputs.riskLevel,
    };
    const matches = evaluateRules(parsed);
    setResults(matches);
    onRefresh();
    if (matches.length > 0) {
      pushAudit("RULE_TRIGGERED", `Test: ${matches.length} rule(s) fired on score ${inputs.combinedScore}`, { entityType: "rule" });
    }
  };

  const set = (k: string, v: string) => setInputs((p) => ({ ...p, [k]: v }));

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
        <Play className="w-4 h-4 text-[#0052FF]" />
        <p className="text-sm font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Rule Test Lab</p>
        <span className="text-[10px] font-mono text-gray-600 ml-auto">Simulate a prediction against all active rules</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: "combinedScore",  label: "Combined Score" },
            { key: "model1Score",    label: "Model 1 Score" },
            { key: "model2Score",    label: "Model 2 Score" },
            { key: "model3Score",    label: "Model 3 Score" },
            { key: "transactionAmt", label: "Amount ($)" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] font-mono text-gray-600 mb-1">{f.label}</label>
              <input
                type="number"
                value={inputs[f.key as keyof typeof inputs]}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full bg-[#0f0f0f] border border-white/8 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none focus:border-[#0052FF]/40"
              />
            </div>
          ))}
          <div>
            <label className="block text-[10px] font-mono text-gray-600 mb-1">Verdict</label>
            <select value={inputs.verdict} onChange={(e) => set("verdict", e.target.value)}
              className="w-full bg-[#0f0f0f] border border-white/8 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none focus:border-[#0052FF]/40">
              {["FRAUD","SUSPICIOUS","SAFE"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-gray-600 mb-1">Risk Level</label>
            <select value={inputs.riskLevel} onChange={(e) => set("riskLevel", e.target.value)}
              className="w-full bg-[#0f0f0f] border border-white/8 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none focus:border-[#0052FF]/40">
              {["CRITICAL","HIGH","MEDIUM","LOW"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={runTest}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#3378FF] text-white text-xs font-semibold font-mono transition-all shadow-[0_0_15px_rgba(0,82,255,0.3)]"
        >
          <Play className="w-3.5 h-3.5" />
          Run Test
        </button>

        {/* Test results */}
        {results !== null && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 border ${
              results.length > 0
                ? "bg-[#FF3131]/8 border-[#FF3131]/20"
                : "bg-[#00FF41]/8 border-[#00FF41]/20"
            }`}
          >
            {results.length === 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                <p className="text-xs font-mono text-[#00FF41]">No rules triggered — transaction passes rule engine.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[#FF3131]" />
                  <p className="text-xs font-mono text-[#FF3131] font-bold">{results.length} rule(s) triggered</p>
                </div>
                <div className="space-y-2">
                  {results.map(({ rule, action }) => {
                    const actionMeta = ACTIONS.find((a) => a.value === action)!;
                    return (
                      <div key={rule.id} className="flex items-center justify-between gap-3 py-1.5 border-t border-white/5">
                        <span className="text-xs font-mono text-gray-300">{rule.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                          style={{ color: actionMeta.color, backgroundColor: `${actionMeta.color}15`, border: `1px solid ${actionMeta.color}30` }}>
                          {actionMeta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function RulesPage() {
  const [rules, setRules]       = useState<FraudRule[]>([]);
  const [showEditor, setEditor] = useState(false);
  const [editing, setEditing]   = useState<FraudRule | undefined>(undefined);

  const reload = useCallback(() => {
    seedDemoRules();
    setRules(getRules());
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleDelete = (id: string, name: string) => {
    deleteRule(id);
    pushAudit("RULE_DELETED", `Rule '${name}' deleted`, { entityId: id, entityType: "rule" });
    reload();
  };

  const handleToggle = (id: string) => {
    toggleRule(id);
    reload();
  };

  const openNew = () => { setEditing(undefined); setEditor(true); };
  const openEdit = (rule: FraudRule) => { setEditing(rule); setEditor(true); };

  const enabledCount = rules.filter((r) => r.enabled).length;
  const totalTriggers = rules.reduce((s, r) => s + (r.triggerCount || 0), 0);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-2">Agency Tools</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-extrabold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                Rule Engine
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Deterministic rules layered on top of ML scoring. Rules run before or after model inference.
              </p>
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-5 py-3 bg-[#0052FF] hover:bg-[#3378FF] rounded-xl text-white text-sm font-semibold transition-all shadow-[0_0_20px_rgba(0,82,255,0.4)]"
            >
              <Plus className="w-4 h-4" />
              New Rule
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total Rules",    val: rules.length,   color: "#0052FF" },
            { label: "Active",         val: enabledCount,   color: "#00FF41" },
            { label: "Inactive",       val: rules.length - enabledCount, color: "#6B7280" },
            { label: "Total Triggers", val: totalTriggers,  color: "#A855F7" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-4">
              <p className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.val}</p>
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* How it works banner */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="rounded-xl p-4 mb-6 bg-[#0052FF]/6 border border-[#0052FF]/15 flex items-start gap-3"
        >
          <Info className="w-4 h-4 text-[#3378FF] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] font-mono text-gray-400 leading-relaxed">
            Rules are evaluated against every prediction result. When a rule fires, its action executes automatically —
            blocking, escalating, flagging, or creating a case. Use <strong className="text-gray-300">AND</strong> logic
            for precision (all conditions must match) and <strong className="text-gray-300">OR</strong> logic for coverage (any match triggers).
            Rules fire in priority order — lower number runs first.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-6">
          {/* Rule list */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {rules.length === 0 ? (
              <div className="glass-card rounded-2xl py-20 text-center">
                <Zap className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <p className="text-sm font-mono text-gray-600">No rules yet. Create your first rule.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, i) => {
                  const actionMeta = ACTIONS.find((a) => a.value === rule.action)!;
                  return (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`glass-card rounded-2xl overflow-hidden transition-all ${rule.enabled ? "" : "opacity-50"}`}
                    >
                      <div className="px-5 py-4 flex items-start gap-4">
                        {/* Priority badge */}
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/4 border border-white/8 flex items-center justify-center">
                          <span className="text-[10px] font-mono font-bold text-gray-500">{i + 1}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-white">{rule.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                              style={{ color: actionMeta.color, backgroundColor: `${actionMeta.color}12`, border: `1px solid ${actionMeta.color}25` }}>
                              {actionMeta.label}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-gray-500 bg-white/4 border border-white/8">
                              {rule.logic}
                            </span>
                          </div>

                          {rule.description && (
                            <p className="text-[11px] text-gray-600 mb-2">{rule.description}</p>
                          )}

                          {/* Conditions summary */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {rule.conditions.map((c, ci) => (
                              <span key={c.id} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/4 border border-white/6 text-gray-400">
                                {ci > 0 && <span className="text-gray-600 mr-1">{rule.logic}</span>}
                                {c.field} {c.operator} {c.value}
                              </span>
                            ))}
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-gray-700">
                              {rule.triggerCount} trigger{rule.triggerCount !== 1 ? "s" : ""}
                            </span>
                            {rule.lastTriggered && (
                              <span className="text-[10px] font-mono text-gray-700">
                                Last: {new Date(rule.lastTriggered).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => openEdit(rule)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-white hover:bg-white/6 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id, rule.name)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-700 hover:text-[#FF3131] hover:bg-[#FF3131]/8 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggle(rule.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all border"
                            style={
                              rule.enabled
                                ? { color: "#00FF41", backgroundColor: "rgba(0,255,65,0.08)", borderColor: "rgba(0,255,65,0.2)" }
                                : { color: "#6B7280", backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.06)" }
                            }
                          >
                            {rule.enabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                            {rule.enabled ? "ON" : "OFF"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Right column: test panel */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <RuleTestPanel onRefresh={reload} />

            <div className="mt-4 glass-card rounded-2xl p-5">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-4">Action Reference</p>
              <div className="space-y-2.5">
                {ACTIONS.map((a) => (
                  <div key={a.value} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: a.color }} />
                    <div>
                      <p className="text-xs font-mono font-bold" style={{ color: a.color }}>{a.label}</p>
                      <p className="text-[10px] font-mono text-gray-600">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Editor modal */}
      <AnimatePresence>
        {showEditor && (
          <RuleEditorModal
            initial={editing}
            onClose={() => setEditor(false)}
            onSave={reload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
