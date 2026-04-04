"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Cpu, Server, BarChart2 } from "lucide-react";
import type { ModelConfig, ChartDataPoint, ShapFeature } from "@/config/models";

interface Props {
  model: ModelConfig;
}

const accentMap = {
  blue: "#0052FF",
  green: "#00FF41",
  red: "#FF3131",
};

function PrecisionRecallChart({ data, accent }: { data: ChartDataPoint[]; accent: string }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="recall"
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
            label={{ value: "Recall", position: "insideBottom", offset: -5, fill: "#6b7280", fontSize: 10 }}
          />
          <YAxis
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
            label={{ value: "Precision", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 10 }}
          />
          <Tooltip
            formatter={(v: number) => [`${(v * 100).toFixed(1)}%`]}
            labelFormatter={(v: number) => `Recall: ${(v * 100).toFixed(0)}%`}
            contentStyle={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "JetBrains Mono",
            }}
          />
          <Line
            type="monotone"
            dataKey="precision"
            stroke={accent}
            strokeWidth={2}
            dot={false}
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ShapChart({ data, accent }: { data: ShapFeature[]; accent: string }) {
  const sorted = [...data].sort((a, b) => b.importance - a.importance);
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <YAxis
            type="category"
            dataKey="feature"
            tick={{ fill: "#9ca3af", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            width={130}
          />
          <Tooltip
            formatter={(v: number) => [v.toFixed(3), "SHAP Value"]}
            contentStyle={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "JetBrains Mono",
            }}
          />
          <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
            {sorted.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.direction === "positive" ? accent : "#FF3131"}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ModelDeepDive({ model }: Props) {
  const accent = accentMap[model.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          Technical Deep-Dive
        </h3>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full"
          style={{ color: accent, backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}
        >
          {model.chartType === "shap" ? "SHAP Feature Importance" : "Precision-Recall Curve"}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/5">
        {/* Left: Technical summary */}
        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5" style={{ color: accent }} />
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">Architecture</h4>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{model.architecture}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-3.5 h-3.5" style={{ color: accent }} />
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">Performance Metrics</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {model.stats.map((stat) => (
                <div key={stat.label} className="bg-white/3 rounded-lg px-3 py-2 border border-white/5">
                  <p
                    className="text-base font-mono font-bold"
                    style={{ color: stat.highlight ? accent : "#e5e7eb" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-gray-600 font-mono mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-3.5 h-3.5" style={{ color: accent }} />
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">Tech Stack</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {model.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/4 border border-white/7 text-gray-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="p-6">
          <p className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-4">
            {model.chartType === "shap"
              ? "SHAP Feature Importance (magnitude)"
              : "Precision-Recall Tradeoff"}
          </p>
          {model.chartType === "precision-recall" ? (
            <PrecisionRecallChart data={model.chartData as ChartDataPoint[]} accent={accent} />
          ) : (
            <ShapChart data={model.chartData as ShapFeature[]} accent={accent} />
          )}
          <p className="text-[10px] text-gray-600 font-mono mt-4 text-center">
            {model.chartType === "shap"
              ? "Red bars = fraud-increasing features. Colored bars = fraud-decreasing."
              : "Area under curve (AUPRC) reflects performance on imbalanced data."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
