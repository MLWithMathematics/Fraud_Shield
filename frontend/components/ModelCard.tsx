"use client";

import { motion } from "framer-motion";
import { ArrowRight, Cpu, BarChart3 } from "lucide-react";
import Link from "next/link";
import type { ModelConfig } from "@/config/models";

interface Props { model: ModelConfig; index: number; }

const accentMap = {
  blue:   { color: "#0052FF", bg: "rgba(0,82,255,0.12)",   border: "rgba(0,82,255,0.25)" },
  green:  { color: "#00FF41", bg: "rgba(0,255,65,0.10)",   border: "rgba(0,255,65,0.22)" },
  red:    { color: "#FF3131", bg: "rgba(255,49,49,0.10)",  border: "rgba(255,49,49,0.22)" },
  purple: { color: "#A855F7", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.22)" },
};

export default function ModelCard({ model, index }: Props) {
  const accent = accentMap[model.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      className="group relative glass-card rounded-2xl overflow-hidden card-hover"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)` }} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${accent.color}06, transparent)` }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ color: accent.color, backgroundColor: accent.bg, border: `1px solid ${accent.border}` }}>
              {model.category}
            </span>
            <h3 className="text-lg font-bold text-white mt-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              {model.name}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: accent.bg, border: `1px solid ${accent.border}` }}>
            <Cpu className="w-4 h-4" style={{ color: accent.color }} />
          </div>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-4">{model.tagline}</p>

        {/* Pipeline role */}
        <div className="mb-4 px-3 py-2 rounded-lg"
          style={{ backgroundColor: `${accent.color}08`, border: `1px solid ${accent.color}20` }}>
          <p className="text-[10px] font-mono text-gray-600 mb-0.5">PIPELINE ROLE</p>
          <p className="text-xs font-mono" style={{ color: accent.color }}>{model.pipelineRole}</p>
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {model.techStack.map((tech) => (
            <span key={tech} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/4 border border-white/7 text-gray-500">
              {tech}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {model.stats.slice(0, 2).map((stat) => (
            <div key={stat.label} className="bg-white/3 rounded-lg px-3 py-2">
              <p className="text-sm font-mono font-bold"
                style={{ color: stat.highlight ? accent.color : "#e5e7eb" }}>{stat.value}</p>
              <p className="text-[10px] text-gray-600 font-mono mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-xs text-gray-600 font-mono">
            {model.type === "numeric" ? "Structured / CSV data" : "Document image upload"}
          </span>
        </div>

     <Link href={`/test/${model.id}`} className="block w-full">
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 group/btn cursor-pointer"
            style={{ backgroundColor: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}>
            Test Model
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
