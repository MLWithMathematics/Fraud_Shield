"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, RotateCcw, ExternalLink, AlertTriangle } from "lucide-react";
import { getModelById } from "@/config/models";
import { predict } from "@/lib/mockPredict";
import type { PredictionResult } from "@/lib/mockPredict";
import NumericForm from "@/components/NumericForm";
import ImageUploader from "@/components/ImageUploader";
import SecurityReport from "@/components/SecurityReport";
import ScanningOverlay from "@/components/ScanningOverlay";

const accentMap = {
  blue: "#0052FF",
  green: "#00FF41",
  red: "#FF3131",
  purple:"#7f1eab",
};

export default function TestPage() {
  const { modelId } = useParams<{ modelId: string }>();
  const model = getModelById(modelId);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  if (!model) {
    return (
      <div className="min-h-screen pt-28 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF3131]/10 border border-[#FF3131]/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-[#FF3131]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            Model Not Found
          </h1>
          <p className="text-gray-500 mb-6 font-mono text-sm">
            No model with ID &ldquo;{modelId}&rdquo; exists in models.ts
          </p>
          <Link href="/gallery" className="text-[#0052FF] hover:underline font-mono text-sm">
            ← Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const accent = accentMap[model.color];

  const handleNumericSubmit = async (values: Record<string, string>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await predict({ modelId: model.id, fields: values });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSubmit = async (file: File) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await predict({ modelId: model.id, imageFile: file });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 mb-8"
        >
          <Link
            href="/gallery"
            className="flex items-center gap-1.5 text-xs font-mono text-gray-600 hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Model Gallery
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-xs font-mono text-gray-500">{model.name}</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase"
                  style={{ color: accent, backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}
                >
                  {model.category}
                </span>
                <span className="text-[10px] font-mono text-gray-600">
                  {model.type === "numeric" ? "Structured Input" : "Image Input"}
                </span>
              </div>
              <h1
                className="text-4xl font-extrabold text-white mb-3"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {model.name}
              </h1>
              <p className="text-gray-500 max-w-2xl leading-relaxed">{model.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/guide"
                className="flex items-center gap-1.5 px-4 py-2 glass-card rounded-lg text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Integration Guide
              </Link>
            </div>
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {model.techStack.map((t) => (
              <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/4 border border-white/7 text-gray-500">
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Form header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Testing Lab
                  </h2>
                  <p className="text-[11px] font-mono text-gray-600 mt-0.5">
                    {model.type === "numeric"
                      ? "Enter values to run a single prediction"
                      : "Upload a document image for forgery analysis"}
                  </p>
                </div>
                {result && (
                  <button
                    onClick={() => setResult(null)}
                    className="flex items-center gap-1.5 text-xs font-mono text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              <div className="relative p-6">
                {/* Scanning overlay */}
                <ScanningOverlay visible={loading} accent={accent} />

                {model.type === "numeric" && model.inputFields ? (
                  <NumericForm
                    fields={model.inputFields}
                    onSubmit={handleNumericSubmit}
                    loading={loading}
                    accent={accent}
                  />
                ) : (
                  <ImageUploader
                    onSubmit={handleImageSubmit}
                    loading={loading}
                    accent={accent}
                  />
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {model.stats.map((stat) => (
                <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
                  <p
                    className="text-sm font-mono font-bold"
                    style={{ color: stat.highlight ? accent : "#e5e7eb" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-gray-600 font-mono mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {result ? (
                <SecurityReport key="result" result={result} modelName={model.name} />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center gap-4 border-dashed"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${accent}10`, border: `1px solid ${accent}20` }}
                  >
                    {/* Shield SVG */}
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" style={{ color: accent }}>
                      <path
                        d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 12l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text-center px-8">
                    <p className="text-sm font-mono text-gray-500 mb-1">
                      Security Report
                    </p>
                    <p className="text-xs font-mono text-gray-700">
                      {model.type === "numeric"
                        ? "Fill in the fields and run analysis to see the prediction result"
                        : "Upload a document image to begin forensic analysis"}
                    </p>
                  </div>

                  {/* Animated dots */}
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: accent,
                          opacity: 0.3,
                          animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Architecture note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 glass-card rounded-2xl p-6"
        >
          <h3 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-3">
            Architecture Notes
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">{model.architecture}</p>
        </motion.div>
      </div>
    </div>
  );
}
