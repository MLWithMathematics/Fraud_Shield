"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Activity, BrainCircuit, GitMerge,
  ChevronRight, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, AlertCircle, Zap, RotateCcw,
} from "lucide-react";
import { predictCombined, type CombinedResult, type PredictionResult } from "@/lib/mockPredict";
import RiskGauge from "@/components/RiskGauge";
import ScanningOverlay from "@/components/ScanningOverlay";

// ── Colour maps ──────────────────────────────────────────────────
const MODEL_META = [
  { key: "model1", label: "TransactionGuard", short: "XGB+LGB", color: "#0052FF", Icon: Shield,       role: "Transaction Risk Score" },
  { key: "model2", label: "AnomalyNet",       short: "IsoF+AE", color: "#00FF41", Icon: Activity,     role: "Anomaly Flag" },
  { key: "model3", label: "BehaviourGuard",   short: "GBM+LSTM",color: "#A855F7", Icon: BrainCircuit, role: "Behavioural Risk Score" },
] as const;

const RISK_LEVEL_CONFIG = {
  LOW:      { color: "#00FF41", bg: "rgba(0,255,65,0.08)",   border: "rgba(0,255,65,0.25)",   Icon: CheckCircle2 },
  MEDIUM:   { color: "#FFB800", bg: "rgba(255,184,0,0.08)", border: "rgba(255,184,0,0.25)",  Icon: AlertCircle },
  HIGH:     { color: "#FF8800", bg: "rgba(255,136,0,0.08)", border: "rgba(255,136,0,0.25)",  Icon: AlertTriangle },
  CRITICAL: { color: "#FF3131", bg: "rgba(255,49,49,0.09)",  border: "rgba(255,49,49,0.28)",  Icon: AlertTriangle },
};

// ── Combined form fields ─────────────────────────────────────────
const FORM_SECTIONS = [
  {
    label: "Transaction",
    color: "#0052FF",
    icon: Shield,
    fields: [
      { name: "TransactionAmt", label: "Amount ($)",          placeholder: "e.g. 850.00", hint: "All models" },
      { name: "hour",           label: "Hour of Txn (0-23)", placeholder: "e.g. 3",      hint: "All models" },
      { name: "V1",             label: "PCA V1 (velocity)",  placeholder: "e.g. -1.35",  hint: "Models 1 & 2" },
      { name: "V14",            label: "PCA V14 (separator)",placeholder: "e.g. -5.20",  hint: "Model 2" },
    ],
  },
  {
    label: "Card & Product",
    color: "#0052FF",
    icon: Shield,
    fields: [
      { name: "card4",     label: "Card Network",  placeholder: "e.g. visa",  hint: "Model 1" },
      { name: "ProductCD", label: "Product Code",  placeholder: "e.g. W",     hint: "Model 1" },
      { name: "V3",        label: "PCA V3",        placeholder: "e.g. 0.23",  hint: "Model 1" },
      { name: "V4",        label: "PCA V4",        placeholder: "e.g. -0.84", hint: "Model 2" },
    ],
  },
  {
    label: "User Behaviour",
    color: "#A855F7",
    icon: BrainCircuit,
    fields: [
      { name: "user_amt_mean",       label: "User's Avg Amount ($)", placeholder: "e.g. 120.00", hint: "Model 3" },
      { name: "time_since_last_min", label: "Min Since Last Txn",   placeholder: "e.g. 4",      hint: "Model 3" },
      { name: "user_avg_hour",       label: "User's Usual Hour",    placeholder: "e.g. 14",     hint: "Model 3" },
      { name: "user_tx_count",       label: "User's Total Txns",    placeholder: "e.g. 42",     hint: "Model 3" },
    ],
  },
];

// ── Model score card ─────────────────────────────────────────────
function ModelScoreCard({
  meta,
  result,
  weight,
  index,
}: {
  meta: typeof MODEL_META[number];
  result: PredictionResult;
  weight: number;
  index: number;
}) {
  const { color, Icon, label, short, role } = meta;
  const verdictColor = result.verdict === "FRAUD" ? "#FF3131" : result.verdict === "SUSPICIOUS" ? "#FFB800" : "#00FF41";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4 }}
      className="glass-card rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${color}20` }}
    >
      {/* top accent */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      {/* header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate" style={{ fontFamily: "'Syne', sans-serif" }}>{label}</p>
          <p className="text-[10px] font-mono mt-0.5" style={{ color }}>{role}</p>
        </div>
        <span className="text-[10px] font-mono text-gray-600">weight {(weight * 100).toFixed(0)}%</span>
      </div>

      {/* score */}
      <div className="px-5 py-4 flex items-center gap-4">
        {/* big score circle */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle cx="32" cy="32" r="26" fill="none" stroke={verdictColor}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${(result.riskScore / 100) * 163.4} 163.4`}
              style={{ filter: `drop-shadow(0 0 4px ${verdictColor}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold font-mono" style={{ color: verdictColor }}>{result.riskScore}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mb-2"
            style={{ color: verdictColor, backgroundColor: `${verdictColor}15`, border: `1px solid ${verdictColor}30` }}>
            {result.verdict}
          </span>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{result.reasoning}</p>
        </div>
      </div>

      {/* top factors */}
      <div className="px-5 pb-4 space-y-1.5">
        {result.topFactors.slice(0, 3).map((f, i) => (
          <div key={i} className="flex items-center justify-between gap-2 py-1 border-t border-white/4">
            <span className="text-[10px] font-mono text-gray-500 truncate">{f.factor}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[10px] font-mono text-gray-400">{f.contribution}</span>
              {f.direction === "up"
                ? <TrendingUp className="w-3 h-3 text-[#FF3131]" />
                : <TrendingDown className="w-3 h-3 text-[#00FF41]" />}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Pipeline flow diagram ────────────────────────────────────────
function PipelineDiagram({ result }: { result: CombinedResult }) {
  const rl = RISK_LEVEL_CONFIG[result.riskLevel];
  const RLIcon = rl.Icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="glass-card rounded-2xl p-6"
    >
      <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-5">
        Combined Risk Engine — Execution Flow
      </p>

      <div className="flex flex-col items-center gap-0">
        {/* Incoming tx */}
        <div className="px-5 py-2.5 rounded-xl bg-white/4 border border-white/10 text-xs font-mono text-gray-300">
          📥 Incoming Transaction
        </div>

        {/* Arrow down to 3 models */}
        <div className="flex flex-col items-center my-1">
          <div className="w-px h-4 bg-white/10" />
          <div className="text-gray-700 text-[10px] font-mono">parallel</div>
          <div className="w-px h-2 bg-white/10" />
        </div>

        {/* 3 model boxes */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {MODEL_META.map((m, i) => {
            const modelKey = m.key as "model1" | "model2" | "model3";
            const score = result[modelKey].riskScore;
            const w = result.weights[modelKey as "model1" | "model2" | "model3"];
            return (
              <div key={m.key} className="flex flex-col items-center gap-1">
                {/* branch line */}
                <div className="w-px h-3" style={{ backgroundColor: m.color + "60" }} />
                <div className="w-full rounded-xl border px-3 py-2.5 text-center"
                  style={{ borderColor: `${m.color}30`, backgroundColor: `${m.color}08` }}>
                  <p className="text-[10px] font-mono font-bold" style={{ color: m.color }}>{m.short}</p>
                  <p className="text-[9px] text-gray-600 font-mono mt-0.5">{m.role.split(" ")[0]} Score</p>
                  <p className="text-lg font-mono font-bold mt-1" style={{ color: m.color }}>{score}</p>
                  <p className="text-[9px] text-gray-600 font-mono">×{(w * 100).toFixed(0)}% weight</p>
                </div>
                <div className="w-px h-3" style={{ backgroundColor: m.color + "60" }} />
              </div>
            );
          })}
        </div>

        {/* Weighted avg */}
        <div className="flex flex-col items-center">
          <div className="flex gap-3 items-center">
            <div className="h-px w-12 bg-gradient-to-r from-[#0052FF]/40 to-transparent" />
            <div className="h-px w-12 bg-[#00FF41]/40" />
            <div className="h-px w-12 bg-gradient-to-l from-[#A855F7]/40 to-transparent" />
          </div>
          <div className="w-px h-2 bg-white/10" />
          <div className="text-[9px] text-gray-600 font-mono">weighted average</div>
          <div className="w-px h-2 bg-white/10" />
        </div>

        {/* Combined score */}
        <div className="rounded-xl border px-8 py-3 text-center"
          style={{ borderColor: `${rl.color}35`, backgroundColor: `${rl.color}08` }}>
          <p className="text-[10px] font-mono text-gray-500 mb-1">Combined Risk Score</p>
          <p className="text-4xl font-bold font-mono" style={{ color: rl.color }}>{result.combinedScore}</p>
        </div>

        {/* Arrow */}
        <div className="w-px h-4 bg-white/10" />

        {/* Final verdict */}
        <div className="flex items-center gap-2 px-6 py-3 rounded-xl"
          style={{ backgroundColor: rl.bg, border: `1px solid ${rl.border}` }}>
          <RLIcon className="w-4 h-4" style={{ color: rl.color }} />
          <span className="text-sm font-mono font-bold" style={{ color: rl.color }}>
            {result.riskLevel} RISK — {result.verdict}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function CombinedPage() {
  const [values, setValues]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<CombinedResult | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const handleChange = (name: string, val: string) =>
    setValues((p) => ({ ...p, [name]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await predictCombined(values);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const rl = result ? RISK_LEVEL_CONFIG[result.riskLevel] : null;
  const RLIcon = rl?.Icon ?? Shield;

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-3">
            3-Model Pipeline
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Combined Risk Engine
          </h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed text-sm">
            One transaction — scored by all three models simultaneously.
            Model 1 checks the transaction. Model 2 checks for anomalies.
            Model 3 checks if the user is behaving like themselves.
            A weighted engine combines all three into a single risk verdict.
          </p>

          {/* Pipeline mini-map */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-xs font-mono text-gray-400">
              📥 Transaction
            </div>
            {MODEL_META.map((m) => (
              <div key={m.key} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-gray-700" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono"
                  style={{ borderColor: `${m.color}30`, backgroundColor: `${m.color}08`, color: m.color }}>
                  <m.Icon className="w-3 h-3" />
                  {m.short}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-gray-700" />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
                <GitMerge className="w-3 h-3" />
                Combined Verdict
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main layout: form left, results right */}
        <div className="grid lg:grid-cols-[420px_1fr] gap-8">

          {/* ── LEFT: Input form ─────────────────────────────── */}
          <div>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Transaction Inputs
                  </h2>
                  <p className="text-[11px] font-mono text-gray-600 mt-0.5">
                    Fill all fields for the most accurate pipeline result
                  </p>
                </div>
                {result && (
                  <button onClick={() => { setResult(null); setValues({}); }}
                    className="flex items-center gap-1 text-xs font-mono text-gray-600 hover:text-gray-300 transition-colors">
                    <RotateCcw className="w-3 h-3" />Reset
                  </button>
                )}
              </div>

              <div className="relative p-6 space-y-6">
                <ScanningOverlay visible={loading} accent="#0052FF" />

                {FORM_SECTIONS.map((section) => {
                  const SIcon = section.icon;
                  return (
                    <div key={section.label}>
                      {/* Section heading */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded flex items-center justify-center"
                          style={{ backgroundColor: `${section.color}15` }}>
                          <SIcon className="w-3 h-3" style={{ color: section.color }} />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest"
                          style={{ color: section.color }}>{section.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {section.fields.map((field) => (
                          <div key={field.name}>
                            <label className="block text-[10px] font-mono text-gray-600 mb-1 uppercase tracking-wider">
                              {field.label}
                              <span className="ml-1 text-gray-700 normal-case">({field.hint})</span>
                            </label>
                            <input
                              type="text"
                              placeholder={field.placeholder}
                              value={values[field.name] || ""}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              className="w-full bg-[#0f0f0f] border border-white/8 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono placeholder:text-gray-700 focus:outline-none focus:border-[#0052FF]/40 transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Submit */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                  className="w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#0052FF", color: "#fff",
                    boxShadow: loading ? "none" : "0 0 20px rgba(0,82,255,0.4)" }}>
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Running All 3 Models…</>
                  ) : (
                    <><Zap className="w-4 h-4" />Run Combined Analysis</>
                  )}
                </motion.button>

                {error && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[#FF3131]/10 border border-[#FF3131]/20">
                    <AlertTriangle className="w-4 h-4 text-[#FF3131] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#FF3131] font-mono">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weight breakdown */}
            <div className="mt-4 glass-card rounded-xl p-4">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">Engine Weights</p>
              <div className="space-y-2">
                {MODEL_META.map((m, i) => {
                  const weights = [0.40, 0.30, 0.30];
                  const w = weights[i];
                  return (
                    <div key={m.key} className="flex items-center gap-3">
                      <m.Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: m.color }} />
                      <span className="text-[10px] font-mono text-gray-500 flex-1">{m.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${w * 100}%`, backgroundColor: m.color }} />
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: m.color }}>{(w * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Results ────────────────────────────────── */}
          <div>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-6">

                  {/* Combined verdict banner */}
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
                    style={{ backgroundColor: rl!.bg, border: `1px solid ${rl!.border}` }}>
                    <RiskGauge score={result.combinedScore}
                      verdict={result.verdict} />
                    <div className="text-center sm:text-left">
                      <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                        <RLIcon className="w-5 h-5" style={{ color: rl!.color }} />
                        <span className="text-xl font-bold font-mono" style={{ color: rl!.color }}>
                          {result.riskLevel} RISK
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed max-w-md">
                        Combined score of <strong className="text-white">{result.combinedScore}</strong> from
                        weighted average of all three models.
                        Processed in <strong className="text-white">{result.processingTime}ms</strong>.
                      </p>
                      <div className="flex gap-3 mt-3 flex-wrap justify-center sm:justify-start">
                        {MODEL_META.map((m) => {
                          const mk = m.key as "model1"|"model2"|"model3";
                          return (
                            <span key={m.key} className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                              style={{ color: m.color, backgroundColor: `${m.color}12`, border: `1px solid ${m.color}25` }}>
                              {m.short}: {result[mk].riskScore}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>

                  {/* Individual model cards */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {MODEL_META.map((meta, i) => {
                      const mk = meta.key as "model1"|"model2"|"model3";
                      return (
                        <ModelScoreCard
                          key={meta.key}
                          meta={meta}
                          result={result[mk]}
                          weight={result.weights[mk]}
                          index={i}
                        />
                      );
                    })}
                  </div>

                  {/* Pipeline diagram */}
                  <PipelineDiagram result={result} />
                </motion.div>
              ) : (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass-card rounded-2xl h-full min-h-[500px] flex flex-col items-center justify-center gap-6 px-8">
                  {/* animated pipeline */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="px-4 py-2 rounded-lg bg-white/4 border border-white/8 text-xs font-mono text-gray-500">
                      📥 Incoming Transaction
                    </div>
                    <div className="flex gap-6 items-start">
                      {[{ color: "#0052FF", label: "XGB+LGB" },
                        { color: "#00FF41", label: "IsoF+AE" },
                        { color: "#A855F7", label: "GBM+LSTM" }].map((m, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className="w-px h-4" style={{ backgroundColor: m.color + "40" }} />
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                            className="px-3 py-1.5 rounded-lg border text-[10px] font-mono"
                            style={{ borderColor: `${m.color}30`, color: m.color, backgroundColor: `${m.color}08` }}>
                            {m.label}
                          </motion.div>
                          <div className="w-px h-4" style={{ backgroundColor: m.color + "40" }} />
                        </div>
                      ))}
                    </div>
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
                      className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg">
                      <GitMerge className="w-3.5 h-3.5 text-[#0052FF]" />
                      <span className="text-xs font-mono text-gray-400">Combined Verdict</span>
                    </motion.div>
                  </div>

                  <div className="text-center max-w-xs">
                    <p className="text-sm font-mono text-gray-500 mb-1">Awaiting transaction data</p>
                    <p className="text-xs text-gray-700 font-mono leading-relaxed">
                      Fill in the form and click Run to see all three models score simultaneously, then watch the engine combine their outputs.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
