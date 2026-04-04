"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, FileText, ChevronDown, Zap } from "lucide-react";
import type { NumericField } from "@/config/models";

interface Props {
  fields: NumericField[];
  onSubmit: (values: Record<string, string>) => void;
  loading: boolean;
  accent: string;
}

export default function NumericForm({ fields, onSubmit, loading, accent }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (name: string, val: string) => {
    setValues((prev) => ({ ...prev, [name]: val }));
  };

  const handleCsvDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".csv")) setCsvFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Input fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
              {field.label}
            </label>
            {field.type === "select" ? (
              <div className="relative">
                <select
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full appearance-none bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-opacity-80 transition-colors pr-10"
                  style={{ borderColor: values[field.name] ? `${accent}40` : undefined }}
                >
                  <option value="">Select…</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
            ) : (
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 font-mono placeholder:text-gray-700 focus:outline-none transition-colors"
                style={{ borderColor: values[field.name] ? `${accent}40` : undefined }}
              />
            )}
          </div>
        ))}
      </div>

      {/* CSV upload */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
          Batch Upload (CSV)
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative border border-dashed border-white/10 rounded-xl px-4 py-4 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center flex-shrink-0">
            {csvFile ? (
              <FileText className="w-4 h-4 text-[#00FF41]" />
            ) : (
              <Upload className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {csvFile ? (
              <p className="text-sm font-mono text-[#00FF41] truncate">{csvFile.name}</p>
            ) : (
              <p className="text-sm text-gray-600 font-mono">
                Drop CSV for batch scoring
              </p>
            )}
            <p className="text-[10px] text-gray-700 font-mono mt-0.5">
              Must match model input schema
            </p>
          </div>
          {csvFile && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCsvFile(null); }}
              className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCsvDrop}
          />
        </div>
        {csvFile && (
          <p className="text-[10px] text-[#FFB800] font-mono mt-1.5 ml-1">
            ⚠ CSV batch mode not connected to backend in demo. Single-row prediction active.
          </p>
        )}
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.99 }}
        className="w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: accent,
          boxShadow: loading ? "none" : `0 0 20px ${accent}40`,
          color: "#fff",
        }}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Deep Scanning…
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Run Analysis
          </>
        )}
      </motion.button>
    </form>
  );
}
