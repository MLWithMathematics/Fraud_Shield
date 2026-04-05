"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Shield, Activity, BrainCircuit, GitMerge,
  ChevronRight, ArrowRight, CheckCircle2, AlertTriangle,
  Copy, Check, Info, Zap, BarChart3, Eye,
} from "lucide-react";

// ── tiny copy-button ─────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all"
    >
      {done ? <Check className="w-3 h-3 text-[#00FF41]" /> : <Copy className="w-3 h-3" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

// ── inline code pill ─────────────────────────────────────────
function Code({ children }: { children: string }) {
  return (
    <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/6 border border-white/8 text-gray-300">
      {children}
    </code>
  );
}

// ── section wrapper ──────────────────────────────────────────
function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-16">
      {children}
    </section>
  );
}

// ── callout box ──────────────────────────────────────────────
function Callout({ icon: Icon, color, title, children }: {
  icon: React.ElementType; color: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 p-4 rounded-xl border"
      style={{ borderColor: `${color}25`, backgroundColor: `${color}07` }}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
      <div>
        <p className="text-xs font-mono font-bold mb-1" style={{ color }}>{title}</p>
        <div className="text-xs text-gray-500 leading-relaxed space-y-1">{children}</div>
      </div>
    </div>
  );
}

// ── sample-input table row ────────────────────────────────────
function InputRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <tr className="border-b border-white/5">
      <td className="py-2.5 pr-4 text-xs font-mono text-gray-500">{label}</td>
      <td className="py-2.5 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#00FF41] bg-[#00FF41]/8 px-2 py-0.5 rounded">{value}</span>
          <CopyBtn text={value} />
        </div>
      </td>
      <td className="py-2.5 text-[11px] text-gray-600">{note}</td>
    </tr>
  );
}

// ── step card ─────────────────────────────────────────────────
function StepCard({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0052FF]/15 border border-[#0052FF]/30
        flex items-center justify-center text-xs font-mono font-bold text-[#0052FF]">
        {num}
      </div>
      <div className="flex-1 pb-8 border-b border-white/5">
        <h3 className="text-sm font-bold text-white mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>{title}</h3>
        <div className="text-sm text-gray-500 leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

// ── verdict badge ────────────────────────────────────────────
function Verdict({ v }: { v: "SAFE" | "SUSPICIOUS" | "FRAUD" }) {
  const cfg = {
    SAFE:       { color: "#00FF41", bg: "rgba(0,255,65,0.10)" },
    SUSPICIOUS: { color: "#FFB800", bg: "rgba(255,184,0,0.10)" },
    FRAUD:      { color: "#FF3131", bg: "rgba(255,49,49,0.10)" },
  }[v];
  return (
    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}30` }}>
      {v}
    </span>
  );
}

// ── MODEL DATA ────────────────────────────────────────────────
const MODELS = [
  {
    id: "transaction-classifier",
    icon: Shield, color: "#0052FF",
    name: "Model 1 — TransactionGuard XGB+LGB",
    tag: "Supervised · Transaction Fraud",
    purpose: "Asks whether THIS specific transaction is fraudulent based on its features — amount, card type, PCA velocity signals, time of day.",
    whenToUse: "Use this as your primary fraud gate. It catches known fraud patterns with the highest precision of the three models because it was trained on 20,000+ labelled fraud examples.",
    inputNotes: [
      { field: "Transaction Amount ($)", note: "The dollar value. Large amounts at night are high risk." },
      { field: "PCA Feature V1", note: "Velocity signal from IEEE-CIS. Negative values (< -2) strongly indicate fraud." },
      { field: "PCA Feature V3", note: "Merchant risk signal. Large negative values are suspicious." },
      { field: "Card Network", note: "Visa and Mastercard are baseline. Discover in unusual contexts is higher risk." },
      { field: "Product Code", note: "W = electronic goods (common fraud target). C = cash equivalent (high risk)." },
      { field: "Hour (0–23)", note: "Transactions between midnight and 5am elevate risk significantly." },
    ],
    lowRisk: [
      { label: "Transaction Amount", value: "29.99", note: "Normal retail amount" },
      { label: "V1 (Velocity)",      value: "0.5",   note: "Positive = lower risk" },
      { label: "V3",                 value: "0.2",   note: "Near-zero = normal" },
      { label: "Card Network",       value: "visa",  note: "Common card type" },
      { label: "Product Code",       value: "W",     note: "Standard product" },
      { label: "Hour",               value: "14",    note: "2pm — business hours" },
    ],
    highRisk: [
      { label: "Transaction Amount", value: "8500.00",  note: "Unusually large" },
      { label: "V1 (Velocity)",      value: "-4.2",     note: "Strongly negative" },
      { label: "V3",                 value: "-3.1",     note: "Negative = risky" },
      { label: "Card Network",       value: "discover", note: "Less common" },
      { label: "Product Code",       value: "C",        note: "Cash equivalent" },
      { label: "Hour",               value: "3",        note: "3am — high risk window" },
    ],
    readingResults: [
      "Risk Score 0–34 → SAFE. Transaction is consistent with legitimate patterns.",
      "Risk Score 35–69 → SUSPICIOUS. Consider secondary verification (OTP, call).",
      "Risk Score 70–100 → FRAUD. Block and alert. SHAP factors show the exact cause.",
      "Top Factors: the features are ranked by their SHAP contribution to this specific prediction — not global importance.",
    ],
    testUrl: "/test/transaction-classifier",
  },
  {
    id: "anomaly-detector",
    icon: Activity, color: "#00FF41",
    name: "Model 2 — AnomalyNet Hybrid",
    tag: "Unsupervised · Anomaly Detection",
    purpose: "Asks whether this transaction is statistically unusual — regardless of whether fraud patterns like it have been seen before. It never saw a fraud label during training.",
    whenToUse: "Use this alongside Model 1 to catch zero-day fraud — new attack vectors that were never in the training data. If Model 1 is low-risk but Model 2 is high, the transaction looks statistically novel. Investigate.",
    inputNotes: [
      { field: "Transaction Amount ($)", note: "Mapped to log_amount internally. Extreme values trigger anomaly." },
      { field: "PCA Feature V1", note: "Highest fraud/normal separation in ULB dataset. -6 or below is a strong anomaly signal." },
      { field: "PCA Feature V2", note: "Second most separating feature. Positive extremes are suspicious." },
      { field: "PCA Feature V4", note: "Additional separation signal." },
      { field: "PCA Feature V14", note: "Strongest single separator — values below -5 are very anomalous." },
      { field: "Hour (0–23)", note: "Late-night hours (0–5) have higher anomaly rates in the ULB data." },
    ],
    lowRisk: [
      { label: "Amount",  value: "45.00", note: "Normal small transaction" },
      { label: "V1",      value: "0.1",   note: "Near zero — normal PCA space" },
      { label: "V2",      value: "0.3",   note: "Positive but small" },
      { label: "V4",      value: "0.2",   note: "Near zero" },
      { label: "V14",     value: "-0.1",  note: "Slightly negative — normal" },
      { label: "Hour",    value: "10",    note: "Morning transaction" },
    ],
    highRisk: [
      { label: "Amount",  value: "12500.00", note: "Large, extreme value" },
      { label: "V1",      value: "-6.2",     note: "Extreme negative" },
      { label: "V2",      value: "4.8",      note: "Extreme positive" },
      { label: "V4",      value: "-5.1",     note: "Extreme negative" },
      { label: "V14",     value: "-12.3",    note: "Known fraud cluster" },
      { label: "Hour",    value: "2",        note: "Late-night anomaly" },
    ],
    readingResults: [
      "Risk Score reflects the HYBRID score: weighted average of IsolationForest anomaly score + Autoencoder reconstruction error.",
      "Low score: both models agree this transaction looks like the normal distribution they trained on.",
      "High score: the transaction sits far from the normal cluster — Isolation Forest isolated it quickly, and the Autoencoder reconstructed it poorly.",
      "Top Factors show the features with the highest per-feature reconstruction error — where the model 'struggled' most.",
    ],
    testUrl: "/test/anomaly-detector",
  },
  {
    id: "ato-detector",
    icon: BrainCircuit, color: "#A855F7",
    name: "Model 3 — BehaviourGuard GBM+LSTM",
    tag: "Behavioural Sequence · Account Takeover",
    purpose: "Asks whether this USER is behaving like themselves. Account takeover (ATO) fraud uses valid card credentials — it passes Models 1 and 2 because the transaction looks normal. Only the user's pattern gives it away.",
    whenToUse: "Use when Models 1 and 2 both say SAFE but something feels off — unusually fast succession, a 3am transaction for a user who always transacts at 2pm, or a sudden amount 10× higher than their baseline. ATO is about the sequence, not the transaction.",
    inputNotes: [
      { field: "Transaction Amount ($)", note: "The current transaction amount. Compared against user's own baseline." },
      { field: "User's Typical Amount ($)", note: "The average of this specific user's past transactions. The bigger the gap from current amount, the higher the risk." },
      { field: "Minutes Since Last Txn", note: "If < 5 minutes, is_rapid_tx flag fires. ATO attackers often chain transactions rapidly." },
      { field: "Hour of This Transaction", note: "Compared to user's usual hour. A user who always transacts at 2pm sending at 3am is suspicious." },
      { field: "User's Usual Hour", note: "The average hour this user historically transacts. Deviation from this is a key ATO signal." },
      { field: "Total User Transactions", note: "Newer accounts (low count) have less behavioural baseline — model is less certain." },
    ],
    lowRisk: [
      { label: "Transaction Amount",    value: "95.00",  note: "Close to user baseline" },
      { label: "User's Typical Amount", value: "100.00", note: "Their average" },
      { label: "Min Since Last Txn",    value: "480",    note: "8 hours — normal gap" },
      { label: "Hour",                  value: "14",     note: "2pm — matches pattern" },
      { label: "User's Usual Hour",     value: "13",     note: "1pm typical — close" },
      { label: "Total Txns",            value: "45",     note: "Established account" },
    ],
    highRisk: [
      { label: "Transaction Amount",    value: "4200.00", note: "50× user's baseline" },
      { label: "User's Typical Amount", value: "85.00",  note: "Their average" },
      { label: "Min Since Last Txn",    value: "3",      note: "< 5 min — rapid flag" },
      { label: "Hour",                  value: "2",      note: "2am — unusual for user" },
      { label: "User's Usual Hour",     value: "13",     note: "1pm typical — 11h gap" },
      { label: "Total Txns",            value: "12",     note: "Newer account" },
    ],
    readingResults: [
      "Risk Score reflects: weighted average of GBM behavioral score + LSTM sequence anomaly score.",
      "GBM catches: large deviation from user's own amount baseline, unusual hour, rapid velocity.",
      "LSTM catches: the ORDER of events — $10 → $10 → $10 → $4200 in 3 minutes is different from $4200 as a one-off.",
      "Top Factors describe the specific behavioral signals that raised the flag for this user, not for the population.",
    ],
    testUrl: "/test/ato-detector",
  },
];

// ── COMBINED ENGINE DATA ──────────────────────────────────────
const COMBINED_SCENARIOS = [
  {
    label: "Scenario A — All Clear",
    verdict: "SAFE" as const,
    score: 18,
    description: "Normal daytime transaction, amount matches user pattern, no anomaly signals.",
    inputs: [
      { label: "Amount", value: "35.00" },
      { label: "Hour", value: "11" },
      { label: "V1", value: "0.3" },
      { label: "V14", value: "0.1" },
      { label: "User Avg Amount", value: "40.00" },
      { label: "Min Since Last", value: "600" },
      { label: "User Avg Hour", value: "11" },
      { label: "User Txn Count", value: "80" },
    ],
  },
  {
    label: "Scenario B — Known Fraud Pattern",
    verdict: "FRAUD" as const,
    score: 91,
    description: "All 3 models fire: large amount at 3am, extreme V14, sudden deviation from user baseline.",
    inputs: [
      { label: "Amount", value: "8500.00" },
      { label: "Hour", value: "3" },
      { label: "V1", value: "-4.2" },
      { label: "V14", value: "-12.3" },
      { label: "User Avg Amount", value: "90.00" },
      { label: "Min Since Last", value: "4" },
      { label: "User Avg Hour", value: "13" },
      { label: "User Txn Count", value: "15" },
    ],
  },
  {
    label: "Scenario C — ATO Only (Models 1&2 miss it)",
    verdict: "SUSPICIOUS" as const,
    score: 52,
    description: "Transaction looks normal but user behaviour has changed dramatically. Only Model 3 flags it.",
    inputs: [
      { label: "Amount", value: "120.00" },
      { label: "Hour", value: "1" },
      { label: "V1", value: "0.1" },
      { label: "V14", value: "-0.2" },
      { label: "User Avg Amount", value: "115.00" },
      { label: "Min Since Last", value: "2" },
      { label: "User Avg Hour", value: "14" },
      { label: "User Txn Count", value: "8" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
export default function HowToUsePage() {
  const [activeModel, setActiveModel] = useState(0);
  const [activeScenario, setActiveScenario] = useState(0);

  const TOC = [
    { id: "overview",  label: "Overview" },
    { id: "model1",    label: "Model 1 — TransactionGuard" },
    { id: "model2",    label: "Model 2 — AnomalyNet" },
    { id: "model3",    label: "Model 3 — BehaviourGuard" },
    { id: "combined",  label: "Combined Risk Engine" },
    { id: "results",   label: "Reading Results" },
    { id: "tips",      label: "Tips & Common Mistakes" },
  ];

  const model = MODELS[activeModel];
  const scenario = COMBINED_SCENARIOS[activeScenario];

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[220px_1fr] gap-12">

          {/* ── Sidebar TOC ────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-4">On This Page</p>
              <nav className="space-y-0.5">
                {TOC.map((item) => (
                  <a key={item.id} href={`#${item.id}`}
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 transition-colors py-1.5 px-3 rounded-lg hover:bg-white/3 font-mono">
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-8 space-y-2">
                <Link href="/combined"
                  className="flex items-center gap-2 px-4 py-3 bg-[#0052FF] hover:bg-[#3378FF] rounded-xl text-white text-xs font-medium transition-all">
                  <GitMerge className="w-3.5 h-3.5" />
                  Combined Engine
                </Link>
                <Link href="/gallery"
                  className="flex items-center gap-2 px-4 py-3 glass-card rounded-xl text-gray-400 hover:text-white text-xs font-medium transition-all">
                  <Eye className="w-3.5 h-3.5" />
                  Model Gallery
                </Link>
              </div>
            </div>
          </div>

          {/* ── Main content ────────────────────────────── */}
          <div>

            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-3">Documentation</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                How to Use
                <br />FraudShield AI
              </h1>
              <p className="text-gray-500 leading-relaxed max-w-2xl text-sm">
                A complete guide to running predictions with each model — what each input means,
                what values trigger high risk, how to interpret results, and how to use the
                Combined Risk Engine to see all three models work together.
              </p>
            </motion.div>

            {/* ══ OVERVIEW ══════════════════════════════════ */}
            <Section id="overview">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
                Overview
              </h2>

              {/* Pipeline visual */}
              <div className="glass-card rounded-2xl p-6 mb-6">
                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-5">
                  The 3-Model Detection Pipeline
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: Shield,       color: "#0052FF", n: "01", label: "TransactionGuard XGB+LGB",   role: "Is this TRANSACTION fraudulent?" },
                    { icon: Activity,     color: "#00FF41", n: "02", label: "AnomalyNet Hybrid",           role: "Is this transaction STATISTICALLY UNUSUAL?" },
                    { icon: BrainCircuit, color: "#A855F7", n: "03", label: "BehaviourGuard GBM+LSTM",    role: "Is this USER behaving like THEMSELVES?" },
                    { icon: GitMerge,     color: "#FFB800", n: "→",  label: "Combined Risk Engine",       role: "Weighted verdict: LOW / MEDIUM / HIGH / CRITICAL" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    const isLast = i === 3;
                    return (
                      <div key={item.n}>
                        {i === 3 && <div className="flex items-center gap-2 my-1 pl-4">
                          <div className="w-px h-4 bg-white/10" />
                          <span className="text-[10px] text-gray-700 font-mono">weighted average</span>
                        </div>}
                        <div className="flex items-center gap-4 px-4 py-3 rounded-xl"
                          style={{ backgroundColor: `${item.color}08`, border: `1px solid ${item.color}18` }}>
                          <span className="text-xs font-mono font-bold w-6 text-center flex-shrink-0"
                            style={{ color: item.color }}>{item.n}</span>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${item.color}15` }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white">{item.label}</p>
                            <p className="text-[11px] font-mono mt-0.5" style={{ color: item.color }}>{item.role}</p>
                          </div>
                          {!isLast && (
                            <Link href={`/test/${["transaction-classifier","anomaly-detector","ato-detector"][i]}`}
                              className="text-[10px] font-mono flex items-center gap-1 flex-shrink-0 hover:opacity-80 transition-opacity"
                              style={{ color: item.color }}>
                              Test <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          {isLast && (
                            <Link href="/combined"
                              className="text-[10px] font-mono flex items-center gap-1 flex-shrink-0 text-[#FFB800] hover:opacity-80">
                              Open <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Individual testing",  desc:  "Go to Model Gallery → click "Test Model" on any card → fill inputs → Run Analysis.', color: "#0052FF" },
                  { label: "Combined engine",     desc: "Go to Risk Engine from the navbar → fill the unified form → Run Combined Analysis.", color: "#A855F7"  },
                  { label: "Reading results",     desc: "Every prediction returns a 0–100 risk score, SAFE/SUSPICIOUS/FRAUD verdict, reasoning text, and top factors.", color: "#00FF41" },
                ].map((item) => (
                  <div key={item.label} className="glass-card rounded-xl p-4">
                    <div className="w-1.5 h-1.5 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                    <p className="text-xs font-bold text-white mb-1">{item.label}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ══ PER-MODEL TABS ════════════════════════════ */}
            {/* Tab nav */}
            <div className="flex gap-2 mb-2 flex-wrap" id="model1">
              {MODELS.map((m, i) => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => setActiveModel(i)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all"
                    style={activeModel === i
                      ? { backgroundColor: `${m.color}15`, border: `1px solid ${m.color}40`, color: m.color }
                      : { border: "1px solid rgba(255,255,255,0.07)", color: "#6b7280" }}>
                    <Icon className="w-3.5 h-3.5" />
                    Model {i + 1}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeModel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                className="glass-card rounded-2xl overflow-hidden mb-16"
                style={{ border: `1px solid ${model.color}18` }}>

                {/* model header */}
                <div className="px-6 py-5 border-b border-white/5"
                  style={{ background: `linear-gradient(135deg, ${model.color}08 0%, transparent 60%)` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${model.color}15`, border: `1px solid ${model.color}30` }}>
                      <model.icon className="w-4 h-4" style={{ color: model.color }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {model.name}
                      </h2>
                      <span className="text-[10px] font-mono" style={{ color: model.color }}>{model.tag}</span>
                    </div>
                    <Link href={model.testUrl}
                      className="ml-auto flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg transition-all"
                      style={{ color: model.color, backgroundColor: `${model.color}12`, border: `1px solid ${model.color}25` }}>
                      <Zap className="w-3 h-3" />Test this model
                    </Link>
                  </div>
                </div>

                <div className="p-6 space-y-8">

                  {/* Purpose & when to use */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Callout icon={Info} color={model.color} title="What it does">
                      <p>{model.purpose}</p>
                    </Callout>
                    <Callout icon={CheckCircle2} color="#00FF41" title="When to use it">
                      <p>{model.whenToUse}</p>
                    </Callout>
                  </div>

                  {/* Input field guide */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      <BarChart3 className="w-4 h-4" style={{ color: model.color }} />
                      What Each Input Means
                    </h3>
                    <div className="space-y-2">
                      {model.inputNotes.map((inp) => (
                        <div key={inp.field} className="flex gap-3 p-3 rounded-lg bg-white/2 border border-white/5">
                          <div className="w-1 flex-shrink-0 rounded-full mt-1" style={{ backgroundColor: model.color, minHeight: "1rem" }} />
                          <div>
                            <p className="text-xs font-mono text-gray-300 font-semibold">{inp.field}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{inp.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample inputs */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                      Sample Test Values — Copy & Paste
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Low risk */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-[#00FF41]" />
                          <span className="text-xs font-mono text-[#00FF41]">Low Risk — expect SAFE</span>
                        </div>
                        <div className="rounded-xl border border-white/7 overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/5 bg-white/2">
                                <th className="text-left py-2 px-3 text-[10px] font-mono text-gray-600">Field</th>
                                <th className="text-left py-2 px-3 text-[10px] font-mono text-gray-600">Value</th>
                                <th className="text-left py-2 px-3 text-[10px] font-mono text-gray-600">Why</th>
                              </tr>
                            </thead>
                            <tbody className="px-3">
                              {model.lowRisk.map((r) => (
                                <tr key={r.label} className="border-b border-white/4">
                                  <td className="py-2 px-3 text-[11px] font-mono text-gray-500">{r.label}</td>
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] font-mono text-[#00FF41] bg-[#00FF41]/8 px-1.5 py-0.5 rounded">{r.value}</span>
                                      <CopyBtn text={r.value} />
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-[10px] text-gray-600">{r.note}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* High risk */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-[#FF3131]" />
                          <span className="text-xs font-mono text-[#FF3131]">High Risk — expect FRAUD</span>
                        </div>
                        <div className="rounded-xl border border-white/7 overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/5 bg-white/2">
                                <th className="text-left py-2 px-3 text-[10px] font-mono text-gray-600">Field</th>
                                <th className="text-left py-2 px-3 text-[10px] font-mono text-gray-600">Value</th>
                                <th className="text-left py-2 px-3 text-[10px] font-mono text-gray-600">Why</th>
                              </tr>
                            </thead>
                            <tbody>
                              {model.highRisk.map((r) => (
                                <tr key={r.label} className="border-b border-white/4">
                                  <td className="py-2 px-3 text-[11px] font-mono text-gray-500">{r.label}</td>
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] font-mono text-[#FF3131] bg-[#FF3131]/8 px-1.5 py-0.5 rounded">{r.value}</span>
                                      <CopyBtn text={r.value} />
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-[10px] text-gray-600">{r.note}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reading results */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      <Eye className="w-4 h-4" style={{ color: model.color }} />
                      How to Read the Results
                    </h3>
                    <div className="space-y-2">
                      {model.readingResults.map((line, i) => (
                        <div key={i} className="flex gap-2.5 text-xs text-gray-500 leading-relaxed">
                          <span className="text-[10px] font-mono mt-0.5" style={{ color: model.color }}>›</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={model.testUrl}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-semibold transition-all group"
                    style={{ backgroundColor: `${model.color}15`, border: `1px solid ${model.color}30`, color: model.color }}>
                    <Zap className="w-4 h-4" />
                    Test {["Model 1","Model 2","Model 3"][activeModel]} Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ══ COMBINED ENGINE ═══════════════════════════ */}
            <Section id="combined">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                Combined Risk Engine
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                The <Code>/combined</Code> page runs all three models with a single form submission
                and combines their scores using weighted averaging (40%/30%/30%).
              </p>

              {/* How to use steps */}
              <div className="mb-8 space-y-0">
                <StepCard num="1" title="Go to the Risk Engine page">
                  <p>Click <strong className="text-white">Risk Engine</strong> in the navbar, or go directly to <Code>/combined</Code>.</p>
                </StepCard>
                <StepCard num="2" title="Fill the unified input form">
                  <p>The form has three sections — <span className="text-[#0052FF]">Transaction</span>, <span className="text-[#0052FF]">Card & Product</span>, and <span className="text-[#A855F7]">User Behaviour</span>. Fill as many fields as you know. Empty fields default to neutral values.</p>
                  <p>Fields labelled <Code>(Models 1 & 2)</Code> affect those two models. Fields labelled <Code>(Model 3)</Code> control behavioural signals.</p>
                </StepCard>
                <StepCard num="3" title='Click "Run Combined Analysis"'>
                  <p>The scanning overlay runs while all three models score in sequence. This takes about 2–3 seconds.</p>
                </StepCard>
                <StepCard num="4" title="Read the combined verdict banner">
                  <p>At the top: an animated gauge with the <strong className="text-white">combined score</strong> (weighted average) and a <strong className="text-white">LOW/MEDIUM/HIGH/CRITICAL</strong> risk level.</p>
                  <p>Below: three individual score cards — one per model — each showing score, verdict, reasoning, and top factors.</p>
                </StepCard>
                <StepCard num="5" title="Check the Pipeline Diagram">
                  <p>At the bottom of the results: an animated flow diagram showing how all three scores fed into the combined verdict, with their actual numeric values and weights.</p>
                </StepCard>
              </div>

              {/* Scenario picker */}
              <h3 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
                Try These Combined Scenarios
              </h3>
              <div className="flex gap-2 mb-4 flex-wrap">
                {COMBINED_SCENARIOS.map((s, i) => (
                  <button key={i} onClick={() => setActiveScenario(i)}
                    className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${activeScenario === i ? "border-[#0052FF]/40 bg-[#0052FF]/12 text-[#0052FF]" : "border-white/8 text-gray-500 hover:text-gray-300"}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeScenario} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-card rounded-2xl p-5 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Verdict v={scenario.verdict} />
                    <span className="text-xs font-mono text-gray-600">Expected combined score ~{scenario.score}</span>
                    <span className="text-[11px] text-gray-500 ml-2">{scenario.description}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {scenario.inputs.map((inp) => (
                      <div key={inp.label} className="bg-white/3 rounded-lg p-2.5 border border-white/5">
                        <p className="text-[10px] font-mono text-gray-600 mb-1">{inp.label}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-gray-300">{inp.value}</span>
                          <CopyBtn text={inp.value} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <Link href="/combined"
                className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-semibold bg-[#0052FF] hover:bg-[#3378FF] text-white transition-all group"
                style={{ boxShadow: "0 0 20px rgba(0,82,255,0.3)" }}>
                <GitMerge className="w-4 h-4" />
                Open Combined Risk Engine
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Section>

            {/* ══ READING RESULTS ═══════════════════════════ */}
            <Section id="results">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
                Reading Every Result
              </h2>

              <div className="space-y-4">
                {/* Score gauge */}
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Risk Score Gauge (0–100)
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { range: "0–34", label: "SAFE",       color: "#00FF41", desc: "All signals within normal range. No action needed." },
                      { range: "35–69", label: "SUSPICIOUS", color: "#FFB800", desc: "Borderline signals. Consider secondary verification." },
                      { range: "70–100", label: "FRAUD",     color: "#FF3131", desc: "High-confidence fraud/anomaly/ATO detected. Block or escalate." },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl p-3 border text-center"
                        style={{ borderColor: `${item.color}25`, backgroundColor: `${item.color}06` }}>
                        <p className="text-xs font-mono font-bold mb-0.5" style={{ color: item.color }}>{item.range}</p>
                        <Verdict v={item.label as "SAFE" | "SUSPICIOUS" | "FRAUD"} />
                        <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top factors */}
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Top Contributing Factors
                  </h3>
                  <div className="space-y-2 text-xs text-gray-500">
                    <p>Each factor row shows: <Code>Feature name</Code> → <Code>its value for this prediction</Code> → an <span className="text-[#FF3131]">↑ up arrow</span> (increases fraud risk) or <span className="text-[#00FF41]">↓ down arrow</span> (decreases risk).</p>
                    <p><strong className="text-white">Model 1:</strong> factors come from SHAP TreeExplainer — the exact mathematical contribution of each feature to the fraud probability for this specific transaction.</p>
                    <p><strong className="text-white">Model 2:</strong> factors are per-feature reconstruction errors — the features the Autoencoder struggled most to reconstruct, meaning they were most different from the normal distribution.</p>
                    <p><strong className="text-white">Model 3:</strong> factors describe the specific behavioral deviation signals — how much the amount deviates from the user's own baseline, how unusual the hour is for them, etc.</p>
                  </div>
                </div>

                {/* Reasoning text */}
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Reasoning Text
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    The reasoning block is a human-readable sentence generated by the backend from the actual model outputs — it includes the exact probability, the threshold, and which specific signals pushed the verdict. It is not a template; it changes based on the actual values you submitted.
                  </p>
                </div>
              </div>
            </Section>

            {/* ══ TIPS ══════════════════════════════════════ */}
            <Section id="tips">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
                Tips & Common Mistakes
              </h2>

              <div className="space-y-4">
                <Callout icon={CheckCircle2} color="#00FF41" title="Getting the most accurate predictions">
                  <p>For Model 1: the model trained on 142 features. The 6 fields in the form cover the most important ones. Filling V1 and TransactionAmt is usually enough to get meaningful results.</p>
                  <p>For Model 3: the more accurately you fill "User's Typical Amount" and "User's Usual Hour", the more realistic the behavioural deviation signal. If those match the current transaction, risk will be low.</p>
                </Callout>

                <Callout icon={AlertTriangle} color="#FFB800" title="The V features (V1, V2, V3 …)">
                  <p>These are PCA-transformed features from the IEEE-CIS dataset — they do not map to simple real-world quantities. Think of them as "encoded velocity/merchant/device signals." The training data documentation does not reveal what they represent.</p>
                  <p>Rule of thumb: values near 0 are normal. Extreme values (below -3 or above +3) represent outliers in the original feature space and raise risk.</p>
                </Callout>

                <Callout icon={AlertTriangle} color="#FF3131" title="Common mistake — leaving all fields blank">
                  <p>Empty fields default to neutral/zero values. This will almost always return a SAFE verdict because the model sees a perfectly average transaction. Always fill at least Amount and one V feature for meaningful results.</p>
                </Callout>

                <Callout icon={Info} color="#0052FF" title="The Combined Engine vs individual models">
                  <p>Individual model pages are useful for understanding each model in isolation and debugging. The Combined Engine is the realistic deployment scenario — use it to see how the three models interact and cover each other's blind spots.</p>
                  <p>Scenario C in the Combined section above is the key example: Models 1 and 2 both say SAFE (normal transaction, normal statistics), but Model 3 catches it because the user is behaving out of character.</p>
                </Callout>

                <Callout icon={Info} color="#A855F7" title="FastAPI server must be running">
                  <p>All predictions require the Python backend. If you see a network error, check that <Code>uvicorn main:app --reload --port 8000</Code> is running in a separate terminal. The health check at <Code>http://localhost:8000</Code> confirms which models are loaded.</p>
                </Callout>
              </div>
            </Section>

          </div>{/* end main content */}
        </div>{/* end grid */}
      </div>
    </div>
  );
}
