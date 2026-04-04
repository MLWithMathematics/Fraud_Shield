"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Shield, Clock, Cpu, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import RiskGauge from "./RiskGauge";
import type { PredictionResult } from "@/lib/mockPredict";

interface Props {
  result: PredictionResult;
  modelName: string;
}

const verdictConfig = {
  SAFE: {
    color: "#00FF41",
    bg: "rgba(0,255,65,0.06)",
    border: "rgba(0,255,65,0.2)",
    Icon: ShieldCheck,
    headline: "Transaction Cleared",
    description: "No significant fraud indicators detected.",
  },
  SUSPICIOUS: {
    color: "#FFB800",
    bg: "rgba(255,184,0,0.06)",
    border: "rgba(255,184,0,0.2)",
    Icon: Shield,
    headline: "Manual Review Required",
    description: "Borderline risk signals detected — escalating for review.",
  },
  FRAUD: {
    color: "#FF3131",
    bg: "rgba(255,49,49,0.07)",
    border: "rgba(255,49,49,0.25)",
    Icon: ShieldAlert,
    headline: "Fraud Detected — Blocked",
    description: "High-confidence fraud indicators. Transaction halted.",
  },
};

export default function SecurityReport({ result, modelName }: Props) {
  const cfg = verdictConfig[result.verdict];
  const Icon = cfg.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${cfg.border}`, backgroundColor: cfg.bg }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: cfg.border }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${cfg.color}20`, border: `1px solid ${cfg.color}30` }}
          >
            <Icon className="w-4 h-4" style={{ color: cfg.color }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{cfg.headline}</p>
            <p className="text-[11px] font-mono text-gray-500">{cfg.description}</p>
          </div>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full hidden sm:block"
          style={{ color: cfg.color, backgroundColor: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}
        >
          SECURITY REPORT
        </span>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-8">
        {/* Left: Gauge + meta */}
        <div className="flex flex-col items-center gap-4">
          <RiskGauge score={result.riskScore} verdict={result.verdict} />

          {/* Meta stats */}
          <div className="w-full grid grid-cols-3 gap-2">
            {[
              { label: "Confidence", value: `${(result.confidence * 100).toFixed(1)}%` },
              { label: "Latency", value: `${result.processingTime}ms` },
              { label: "Model", value: result.modelVersion },
            ].map(({ label, value }) => (
              <div key={label} className="text-center bg-white/3 rounded-xl py-2 px-1 border border-white/5">
                <p className="text-xs font-mono font-bold text-gray-200 truncate">{value}</p>
                <p className="text-[9px] font-mono text-gray-600 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Reasoning + factors */}
        <div className="space-y-5">
          {/* Reasoning */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5 text-gray-500" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-500">Model Reasoning</h4>
            </div>
            <div
              className="rounded-xl p-4 text-sm text-gray-400 leading-relaxed border"
              style={{ backgroundColor: "rgba(0,0,0,0.3)", borderColor: "rgba(255,255,255,0.05)" }}
            >
              <span className="font-mono text-[10px] text-gray-600 block mb-1">&gt; analysis_output</span>
              {result.reasoning}
            </div>
          </div>

          {/* Top factors */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-500">Top Contributing Factors</h4>
            </div>
            <div className="space-y-2">
              {result.topFactors.map((factor, i) => (
                <motion.div
                  key={factor.factor}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-white/3 border border-white/5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                    <span className="text-xs font-mono text-gray-400 truncate">{factor.factor}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono text-gray-300">{factor.contribution}</span>
                    {factor.direction === "up" ? (
                      <TrendingUp className="w-3.5 h-3.5 text-[#FF3131]" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-[#00FF41]" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div
        className="px-6 py-3 border-t flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        <p className="text-[10px] font-mono text-gray-700">
          Scored by {modelName} · {new Date().toLocaleTimeString()}
        </p>
        <p className="text-[10px] font-mono text-gray-700">
          Demo mode — connect FastAPI for live results
        </p>
      </div>
    </motion.div>
  );
}
