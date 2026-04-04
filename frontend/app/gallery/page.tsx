"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import ModelCard from "@/components/ModelCard";
import ModelDeepDive from "@/components/ModelDeepDive";
import { models } from "@/config/models";
import type { ModelConfig } from "@/config/models";

const FILTERS = ["All", "numeric", "image"] as const;
type Filter = (typeof FILTERS)[number];

export default function GalleryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<ModelConfig | null>(null);

  const filtered = models.filter((m) => {
    const matchFilter = filter === "All" || m.type === filter;
    const matchQuery =
      !query ||
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.category.toLowerCase().includes(query.toLowerCase()) ||
      m.techStack.some((t) => t.toLowerCase().includes(query.toLowerCase()));
    return matchFilter && matchQuery;
  });

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-3">
            Model Registry
          </p>
          <h1
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Detection Arsenal
          </h1>
          <p className="text-gray-500 max-w-xl leading-relaxed">
            {models.length} production-ready models, dynamically loaded from{" "}
            <code className="text-[#0052FF] font-mono text-sm bg-[#0052FF]/10 px-1.5 py-0.5 rounded">
              config/models.ts
            </code>
            . Filter, explore, and test each one live.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              placeholder="Search models, categories, tech…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-xl text-sm text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-[#0052FF]/40 transition-colors font-mono"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1 p-1 bg-[#0f0f0f] border border-white/7 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-gray-600 ml-2" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all capitalize ${
                  filter === f
                    ? "bg-[#0052FF] text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {f === "All" ? "All Models" : f === "numeric" ? "Structured" : "Image"}
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="flex items-center px-4 py-2.5 glass-card rounded-xl">
            <span className="text-sm font-mono text-gray-500">
              <span className="text-[#0052FF] font-bold">{filtered.length}</span> / {models.length} models
            </span>
          </div>
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-gray-600 font-mono"
            >
              No models match your filter.
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
            >
              {filtered.map((model, i) => (
                <div
                  key={model.id}
                  onClick={() => setSelected(selected?.id === model.id ? null : model)}
                  className="cursor-pointer"
                >
                  <div
                    className={`rounded-2xl transition-all duration-200 ${
                      selected?.id === model.id ? "ring-2 ring-[#0052FF]/40" : ""
                    }`}
                  >
                    <ModelCard model={model} index={i} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deep-Dive Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {selected.name} — Technical Deep-Dive
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className="flex items-center gap-1.5 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Close
                </button>
              </div>
              <ModelDeepDive model={selected} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
