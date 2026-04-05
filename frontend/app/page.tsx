"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight, Shield, Zap, BrainCircuit, GitMerge, BarChart3, Activity, Database } from "lucide-react";
import LivePulse from "@/components/LivePulse";
import StatsBar from "@/components/StatsBar";
import ModelCard from "@/components/ModelCard";
import { models } from "@/config/models";

const PIPELINE_STEPS = [
  {
    step: "01", icon: Shield, color: "#0052FF",
    label: "TransactionGuard XGB+LGB",
    role: "Transaction Risk Score",
    desc: "XGBoost + LightGBM ensemble scores the transaction itself — amount, velocity features, card metadata.",
  },
  {
    step: "02", icon: Activity, color: "#00FF41",
    label: "AnomalyNet Hybrid",
    role: "Anomaly Flag",
    desc: "IsolationForest + Autoencoder checks whether this transaction looks statistically unusual — no fraud labels needed.",
  },
  {
    step: "03", icon: BrainCircuit, color: "#A855F7",
    label: "BehaviourGuard LSTM",
    role: "Behavioural Risk Score",
    desc: "GBM + LSTM reads the user's last 5 transactions as a sequence — detects account takeover even when the transaction looks normal.",
  },
  {
    step: "→", icon: GitMerge, color: "#FFB800",
    label: "Combined Risk Engine",
    role: "LOW / MEDIUM / HIGH / CRITICAL",
    desc: "Weighted average (40%/30%/30%) of all three scores → single dashboard alert with full reasoning.",
  },
];

const HOW_STEPS = [
  { icon: Database, accent: "#0052FF", title: "Real Training Data",
    desc: "Both transaction models train on real Kaggle datasets — IEEE-CIS (590K) and ULB Credit Card (284K). The ATO model engineers behavioral sequences from the same IEEE-CIS data." },
  { icon: BrainCircuit, accent: "#00FF41", title: "Three Complementary Lenses",
    desc: "Supervised catches known fraud. Unsupervised catches anomalies. LSTM sequence model catches account takeover. Each covers blind spots of the other two." },
  { icon: Zap, accent: "#A855F7", title: "FastAPI Backend",
    desc: "Each model is loaded from a .pkl artifact into a FastAPI server. The /predict/combined endpoint runs all three in sequence and returns individual + weighted scores." },
  { icon: BarChart3, accent: "#FFB800", title: "Explainable Results",
    desc: "Every prediction ships with a risk gauge, verdict, reasoning text, and top contributing factors — from SHAP values, reconstruction errors, or behavioral deviation signals." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-6 w-24 h-24 border-l border-t border-[#0052FF]/20 rounded-tl-2xl pointer-events-none" />
        <div className="absolute top-20 right-6 w-24 h-24 border-r border-t border-[#0052FF]/20 rounded-tr-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0052FF]/10 border border-[#0052FF]/20 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
                <span className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.2em]">
                  3 Real ML Models · Live Pipeline · Full Explainability
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                Intelligence<br />Against{" "}
                <span className="text-gradient-blue">Financial</span><br />Crime.
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
                A 3-model fraud detection pipeline — supervised transaction scoring,
                unsupervised anomaly detection, and LSTM behavioural sequence analysis —
                combined into a single risk verdict.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-3">
                <Link href="/combined"
                  className="flex items-center gap-2 px-6 py-3.5 bg-[#0052FF] hover:bg-[#3378FF] rounded-xl text-white text-sm font-semibold transition-all duration-200 group shadow-blue-glow">
                  <GitMerge className="w-4 h-4" />
                  Run Combined Analysis
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/gallery"
                  className="flex items-center gap-2 px-6 py-3.5 glass-card rounded-xl text-gray-300 hover:text-white text-sm font-medium transition-all">
                  Model Gallery
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-2 mt-8">
                {["XGBoost", "LightGBM", "IsolationForest", "Keras LSTM", "SHAP", "FastAPI"].map((tag) => (
                  <span key={tag} className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/4 border border-white/7 text-gray-600">
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="flex justify-center lg:justify-end">
              <LivePulse />
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
      </section>

      {/* ═══ STATS ═══ */}
      <StatsBar />

      {/* ═══ PIPELINE FLOWCHART ═══ */}
      <section className="py-20 px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0052FF]/20 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-3">Detection Pipeline</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              How a Transaction Flows Through the System
            </h2>
          </motion.div>

          {/* Pipeline cards */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4">
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === PIPELINE_STEPS.length - 1;
              return (
                <div key={step.step} className="flex lg:flex-col items-center gap-4 flex-1">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                    className="flex-1 glass-card rounded-2xl p-5 w-full relative overflow-hidden group"
                    style={{ border: `1px solid ${step.color}18` }}>
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg,transparent,${step.color},transparent)` }} />

                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}30` }}>
                      <Icon className="w-4 h-4" style={{ color: step.color }} />
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: step.color }}>{step.role}</span>
                    <h3 className="text-sm font-bold text-white mt-1 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {step.label}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>

                    {isLast && (
                      <Link href="/combined"
                        className="mt-4 flex items-center gap-1.5 text-xs font-mono transition-colors group/link"
                        style={{ color: step.color }}>
                        <GitMerge className="w-3.5 h-3.5" />
                        Try the engine
                        <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </motion.div>

                  {/* Connector arrow between steps */}
                  {i < PIPELINE_STEPS.length - 1 && (
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.12 + 0.1 }}
                      className="flex-shrink-0 flex items-center justify-center w-8 h-8 lg:w-auto lg:h-8">
                      <ChevronRight className="w-5 h-5 text-gray-700 rotate-90 lg:rotate-0" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ THREE MODEL CARDS ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-2">Detection Models</p>
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                {models.length} Models, Fully Testable
              </h2>
            </div>
            <Link href="/gallery"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0052FF] transition-colors font-mono group">
              View deep-dive charts
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model, i) => (
              <ModelCard key={model.id} model={model} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-3">Under The Hood</p>
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>How It Works</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-6 relative overflow-hidden group card-hover">
                  <span className="text-4xl font-bold font-mono opacity-10 absolute top-4 right-4"
                    style={{ color: step.accent }}>{String(i + 1).padStart(2, "0")}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${step.accent}15`, border: `1px solid ${step.accent}30` }}>
                    <Icon className="w-4 h-4" style={{ color: step.accent }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ COMBINED ENGINE CTA ═══ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0052FF]/4 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0052FF]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0052FF]/20 to-transparent" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 100% at 50% 50%, rgba(0,82,255,0.06), transparent)" }} />

        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-14 h-14 rounded-2xl bg-[#0052FF]/10 border border-[#0052FF]/20 flex items-center justify-center mx-auto mb-6">
              <GitMerge className="w-6 h-6 text-[#0052FF]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              Run the Full Pipeline
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed text-sm">
              Enter one transaction — all three models score it simultaneously.
              Watch the weighted risk engine combine their outputs into a single
              <span className="font-mono text-white mx-1">LOW / MEDIUM / HIGH / CRITICAL</span>
              alert with per-model reasoning.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/combined"
                className="flex items-center gap-2 px-8 py-4 bg-[#0052FF] hover:bg-[#3378FF] rounded-xl text-white text-sm font-semibold transition-all shadow-blue-glow group">
                <GitMerge className="w-4 h-4" />
                Open Combined Risk Engine
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/gallery"
                className="flex items-center gap-2 px-8 py-4 glass-card rounded-xl text-gray-300 hover:text-white text-sm font-medium transition-all">
                Test Models Individually
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
