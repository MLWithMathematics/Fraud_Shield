"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight, Shield, Zap, BrainCircuit, GitMerge, BarChart3, Activity, Database } from "lucide-react";
import LivePulse from "@/components/LivePulse";
import StatsBar from "@/components/StatsBar";
import ModelCard from "@/components/ModelCard";
import { models } from "@/config/models";

// ── Architecture comparison data ────────────────────────────────────
const architectureRows = [
  { label: "Dataset",       m1: "IEEE-CIS (Kaggle)",          m2: "ULB Credit Card (Kaggle)" },
  { label: "Training rows", m1: "~590,000 transactions",      m2: "284,807 transactions" },
  { label: "Algorithm",     m1: "XGBoost + LightGBM ensemble",m2: "IsolationForest + Keras Autoencoder" },
  { label: "Approach",      m1: "Supervised (labelled fraud)", m2: "Unsupervised (no fraud labels)" },
  { label: "Input",         m1: "31 features + engineered",   m2: "V1–V28 + Amount + Time features" },
  { label: "Best AUC",      m1: "~0.95+ (ensemble)",          m2: "~0.97 (hybrid score)" },
  { label: "Explainability",m1: "SHAP TreeExplainer",         m2: "Per-feature reconstruction error" },
  { label: "Fraud signal",  m1: "High fraud probability",     m2: "High anomaly / reconstruction error" },
];

// ── How It Works steps ──────────────────────────────────────────────
const howItWorksSteps = [
  {
    step: "01",
    icon: Database,
    title: "Real Training Data",
    description: "Both models are trained on real Kaggle fraud datasets — IEEE-CIS (590K transactions) and ULB Credit Card (284K). No synthetic data.",
    accent: "#0052FF",
  },
  {
    step: "02",
    icon: BrainCircuit,
    title: "Two Complementary Approaches",
    description: "The supervised model catches known fraud patterns. The unsupervised model detects entirely new fraud schemes the first model has never seen.",
    accent: "#00FF41",
  },
  {
    step: "03",
    icon: Zap,
    title: "FastAPI Backend",
    description: "Each model is serialised as a .pkl artifact and served through a FastAPI endpoint. The website sends your inputs and renders the live prediction.",
    accent: "#0052FF",
  },
  {
    step: "04",
    icon: BarChart3,
    title: "Explainable Results",
    description: "Every prediction includes a risk score, verdict, reasoning, and top contributing factors from SHAP or reconstruction error analysis.",
    accent: "#00FF41",
  },
];

export default function HomePage() {
  const [model1, model2] = models; // exactly two real models

  return (
    <div className="min-h-screen">

      {/* ═══════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Corner decorations */}
        <div className="absolute top-20 left-6 w-24 h-24 border-l border-t border-[#0052FF]/20 rounded-tl-2xl pointer-events-none" />
        <div className="absolute top-20 right-6 w-24 h-24 border-r border-t border-[#0052FF]/20 rounded-tr-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0052FF]/10 border border-[#0052FF]/20 mb-6"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                <span className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.2em]">
                  2 Production ML Models · Live & Testable
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Intelligence
                <br />
                Against{" "}
                <span className="text-gradient-blue">Financial</span>
                <br />
                Crime.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-500 text-base leading-relaxed mb-8 max-w-md"
              >
                Two real ML models trained on Kaggle fraud datasets — a supervised XGBoost+LightGBM
                classifier and an unsupervised Isolation Forest+Autoencoder anomaly detector.
                Enter transaction data and get live predictions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link
                  href="/gallery"
                  className="flex items-center gap-2 px-6 py-3.5 bg-[#0052FF] hover:bg-[#3378FF] rounded-xl text-white text-sm font-semibold transition-all duration-200 group shadow-blue-glow"
                >
                  Test the Models
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 px-6 py-3.5 glass-card rounded-xl text-gray-300 hover:text-white text-sm font-medium transition-all duration-200"
                >
                  How It Works
                  <ChevronRight className="w-4 h-4" />
                </a>
              </motion.div>

              {/* Tech pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap gap-2 mt-8"
              >
                {["XGBoost", "LightGBM", "IsolationForest", "Keras", "SHAP", "FastAPI"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/4 border border-white/7 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Live Pulse */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <LivePulse />
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════════════ */}
      <StatsBar />

      {/* ═══════════════════════════════════════════════════════
          TWO MODEL CARDS — the core of the app
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-3">
              Detection Models
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Two Approaches. One Platform.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Supervised learning catches patterns it has seen before. Unsupervised learning
              catches patterns no one has labelled yet. Run them both.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {models.map((model, i) => (
              <ModelCard key={model.id} model={model} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0052FF] transition-colors font-mono group"
            >
              Open Model Gallery — deep-dive charts & architecture
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0052FF]/20 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-3">
              Under The Hood
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              How It Works
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass-card rounded-2xl p-6 relative overflow-hidden group card-hover"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse 70% 50% at 30% 0%, ${step.accent}06, transparent)` }}
                  />
                  <span
                    className="text-4xl font-bold font-mono opacity-10 absolute top-4 right-4"
                    style={{ color: step.accent }}
                  >
                    {step.step}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${step.accent}15`, border: `1px solid ${step.accent}30` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: step.accent }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MODEL COMPARISON TABLE
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-3">
              Side By Side
            </p>
            <h2
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Model Comparison
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Table header */}
            <div className="grid grid-cols-3 border-b border-white/7">
              <div className="px-6 py-4">
                <span className="text-xs font-mono text-gray-600 uppercase tracking-wider">Attribute</span>
              </div>
              <div className="px-6 py-4 border-l border-white/7">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0052FF]" />
                  <span className="text-xs font-mono text-[#0052FF] uppercase tracking-wider font-bold">
                    TransactionGuard
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 font-mono mt-0.5">Supervised</p>
              </div>
              <div className="px-6 py-4 border-l border-white/7">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00FF41]" />
                  <span className="text-xs font-mono text-[#00FF41] uppercase tracking-wider font-bold">
                    AnomalyNet
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 font-mono mt-0.5">Unsupervised</p>
              </div>
            </div>

            {/* Rows */}
            {architectureRows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 ${i < architectureRows.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <div className="px-6 py-3.5">
                  <span className="text-xs font-mono text-gray-500">{row.label}</span>
                </div>
                <div className="px-6 py-3.5 border-l border-white/5">
                  <span className="text-xs text-gray-300">{row.m1}</span>
                </div>
                <div className="px-6 py-3.5 border-l border-white/5">
                  <span className="text-xs text-gray-300">{row.m2}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          WHY TWO MODELS — complementary explanation
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-3">Design Decision</p>
            <h2
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Why Two Models?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Supervised card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0052FF] to-transparent" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#0052FF]/15 border border-[#0052FF]/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#0052FF]" />
                </div>
                <div>
                  <p className="text-xs font-mono text-[#0052FF] uppercase tracking-wider">Model 1</p>
                  <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Supervised Classifier
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Learns from historically labelled fraud — extremely precise on known attack
                patterns because it has seen 20,000+ labelled fraud examples during training.
              </p>
              <div className="space-y-2">
                {[
                  "✓ Very high AUC on known fraud types",
                  "✓ SHAP explains each individual decision",
                  "✓ Threshold tunable for precision vs recall",
                  "✗ Blind to completely new fraud schemes",
                ].map((item) => (
                  <p key={item} className={`text-xs font-mono ${item.startsWith("✓") ? "text-[#00FF41]/80" : "text-[#FF3131]/60"}`}>
                    {item}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Unsupervised card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00FF41] to-transparent" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/25 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[#00FF41]" />
                </div>
                <div>
                  <p className="text-xs font-mono text-[#00FF41] uppercase tracking-wider">Model 2</p>
                  <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Unsupervised Anomaly Detector
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Never sees a fraud label. Instead, it learns what normal looks like, then flags
                anything that deviates — catching zero-day fraud schemes the first model has never encountered.
              </p>
              <div className="space-y-2">
                {[
                  "✓ Catches brand-new, unseen fraud types",
                  "✓ Needs zero fraud labels to train",
                  "✓ Hybrid score fuses two complementary signals",
                  "✗ Higher false-positive rate than supervised",
                ].map((item) => (
                  <p key={item} className={`text-xs font-mono ${item.startsWith("✓") ? "text-[#00FF41]/80" : "text-[#FF3131]/60"}`}>
                    {item}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Fusion arrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#0052FF]/30 to-[#0052FF]/30" />
            <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full">
              <GitMerge className="w-4 h-4 text-[#0052FF]" />
              <span className="text-xs font-mono text-gray-400">
                Run both — supervised catches known, unsupervised catches novel
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#00FF41]/30 to-[#00FF41]/30" />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0052FF]/4 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0052FF]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0052FF]/20 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 100% at 50% 50%, rgba(0,82,255,0.06), transparent)" }}
        />

        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#0052FF]/10 border border-[#0052FF]/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-6 h-6 text-[#0052FF]" />
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Try It Yourself
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed text-sm">
              Enter real transaction values and watch both models score them live.
              The FastAPI backend loads serialised .pkl artifacts and returns predictions with
              SHAP explanations in under 50ms.
            </p>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#0052FF] hover:bg-[#3378FF] rounded-xl text-white text-sm font-semibold transition-all duration-200 shadow-blue-glow group"
            >
              Open Model Gallery
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
