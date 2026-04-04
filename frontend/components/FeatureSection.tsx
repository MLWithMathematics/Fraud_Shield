"use client";

import { motion } from "framer-motion";
import { Zap, Activity, GitBranch } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-time Detection",
    subtitle: "< 12ms Decision Latency",
    description:
      "Synchronous transaction scoring integrated directly into your payment processing pipeline. XGBoost-powered decisions with SHAP explainability at each call.",
    accent: "#0052FF",
    items: ["Sub-100ms SLA", "REST & gRPC endpoints", "Batch scoring API", "SHAP per-prediction"],
  },
  {
    icon: Activity,
    title: "Anomaly Discovery",
    subtitle: "Zero-Label Detection",
    description:
      "Deep autoencoder trained exclusively on clean data. Detects novel fraud patterns that labeled classifiers miss — including zero-day attack vectors.",
    accent: "#00FF41",
    items: ["No fraud labels needed", "Nightly threshold recalibration", "UMAP visualization", "Behavioral drift alerts"],
  },
  {
    icon: GitBranch,
    title: "Graph Analytics",
    subtitle: "Network-Level Insights",
    description:
      "Graph Neural Networks map relationships between accounts, devices, and merchants to surface coordinated fraud rings invisible to per-transaction models.",
    accent: "#FF3131",
    items: ["GNN ring detection", "Device fingerprinting", "Account velocity links", "Community detection"],
    comingSoon: true,
  },
];

export default function FeatureSection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-4">
            Detection Capabilities
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Three Layers of Defense
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            Stacked detection strategies that catch fraud at every level — from individual transactions to coordinated crime networks.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="group relative glass-card rounded-2xl p-6 card-hover overflow-hidden"
              >
                {/* Background glow */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-50"
                  style={{ background: `linear-gradient(90deg, transparent, ${feat.accent}, transparent)` }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 60% 40% at 30% 0%, ${feat.accent}08, transparent)`,
                  }}
                />

                {feat.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20">
                      COMING SOON
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: `${feat.accent}15`,
                    border: `1px solid ${feat.accent}30`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: feat.accent }} />
                </div>

                <h3
                  className="text-lg font-bold text-white mb-1"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {feat.title}
                </h3>
                <p className="text-xs font-mono mb-4" style={{ color: feat.accent }}>
                  {feat.subtitle}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  {feat.description}
                </p>

                {/* Feature list */}
                <div className="space-y-2">
                  {feat.items.map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: feat.accent }}
                      />
                      <span className="text-xs text-gray-500 font-mono">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
