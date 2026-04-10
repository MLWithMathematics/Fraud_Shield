"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImageIcon, X, Zap, FileWarning } from "lucide-react";

interface Props {
  onSubmit: (file: File) => void;
  loading: boolean;
  accent: string;
}

export default function ImageUploader({ onSubmit, loading, accent }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setError(null);
    if (accepted[0]) {
      setFile(accepted[0]);
      const url = URL.createObjectURL(accepted[0]);
      setPreview(url);
    }
  }, []);

  const onDropRejected = useCallback(() => {
    setError("Only JPEG, PNG, or WEBP images up to 10MB are accepted.");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const clearFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-5">
      {/* Dropzone */}
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...(getRootProps() as any)}
            className="relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden"
            style={{
              borderColor: isDragActive ? accent : "rgba(255,255,255,0.1)",
              backgroundColor: isDragActive ? `${accent}08` : "rgba(255,255,255,0.02)",
            }}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4 py-14 px-6 text-center">
              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}
              >
                <Upload className="w-6 h-6" style={{ color: accent }} />
              </motion.div>
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {isDragActive ? "Drop document here…" : "Drag & drop a document image"}
                </p>
                <p className="text-xs text-gray-600 font-mono mt-1">
                  Passport, ID Card, Bank Statement — JPEG, PNG, WEBP · Max 10MB
                </p>
              </div>
              <span
                className="text-xs font-mono px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}
              >
                Browse Files
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Preview image */}
            <div className="relative aspect-video bg-[#0f0f0f] flex items-center justify-center">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Document preview"
                  className="max-h-48 max-w-full object-contain"
                />
              )}
              {/* Scan overlay */}
              {loading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 border-2 border-[#0052FF]/30 rounded-full" />
                    <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-[#0052FF] rounded-full animate-spin" />
                  </div>
                  <p className="text-xs font-mono text-[#0052FF]">Analyzing document…</p>
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-[#0052FF]/60 to-transparent scan-line" />
                  </div>
                </div>
              )}
            </div>
            {/* File info bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">
                  {file.name}
                </span>
                <span className="text-[10px] font-mono text-gray-600">
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              {!loading && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#FF3131]/10 border border-[#FF3131]/20">
          <FileWarning className="w-4 h-4 text-[#FF3131] flex-shrink-0" />
          <p className="text-xs text-[#FF3131] font-mono">{error}</p>
        </div>
      )}

      {/* Note about what the model looks for */}
      <div className="px-4 py-3 rounded-xl bg-white/2 border border-white/5">
        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-wider mb-2">Model checks for</p>
        <div className="flex flex-wrap gap-2">
          {["JPEG DCT artifacts", "Copy-move forgery", "Font inconsistency", "ELA anomalies", "Noise residuals", "Geometry distortion"].map((check) => (
            <span key={check} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/4 text-gray-500">
              {check}
            </span>
          ))}
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="button"
        disabled={!file || loading}
        onClick={() => file && onSubmit(file)}
        whileHover={{ scale: !file || loading ? 1 : 1.01 }}
        whileTap={{ scale: !file || loading ? 1 : 0.99 }}
        className="w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: file ? accent : "rgba(255,255,255,0.05)",
          boxShadow: file && !loading ? `0 0 20px ${accent}40` : "none",
          color: file ? "#fff" : "#6b7280",
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
            Analyze Document
          </>
        )}
      </motion.button>
    </div>
  );
}
