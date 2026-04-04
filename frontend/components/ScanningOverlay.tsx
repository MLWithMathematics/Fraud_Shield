"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const SCAN_MESSAGES = [
  "Initializing threat analysis engine…",
  "Loading model weights into memory…",
  "Running feature extraction pipeline…",
  "Evaluating 500 decision trees…",
  "Computing SHAP attribution values…",
  "Applying calibration threshold…",
  "Generating security report…",
];

interface Props {
  visible: boolean;
  accent: string;
}

export default function ScanningOverlay({ visible, accent }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      setMsgIndex(0);
      setProgress(0);
      return;
    }
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, SCAN_MESSAGES.length - 1));
    }, 270);
    const progInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 98));
    }, 38);
    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl overflow-hidden"
          style={{ backgroundColor: "rgba(10,10,10,0.92)", backdropFilter: "blur(8px)" }}
        >
          {/* Scan line */}
          <div
            className="absolute left-0 right-0 h-0.5 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
              animation: "scanLine 1.5s linear infinite",
            }}
          />

          <div className="flex flex-col items-center gap-6 px-8 max-w-sm w-full">
            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-white/5" />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                style={{ borderTopColor: accent }}
              />
              <div
                className="absolute inset-3 rounded-full border border-transparent animate-spin"
                style={{
                  borderTopColor: `${accent}60`,
                  animationDuration: "0.8s",
                  animationDirection: "reverse",
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold"
                style={{ color: accent }}
              >
                {progress}%
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <p
                className="text-sm font-bold font-mono uppercase tracking-widest"
                style={{ color: accent }}
              >
                Deep Scanning
              </p>
              <p className="text-xs text-gray-600 font-mono mt-1">
                Processing input through detection engine
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}80` }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Log messages */}
            <div className="w-full bg-black/40 rounded-xl p-4 border border-white/5 h-28 overflow-hidden">
              <div className="space-y-1">
                {SCAN_MESSAGES.slice(0, msgIndex + 1).map((msg, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: i === msgIndex ? 1 : 0.3, x: 0 }}
                    className="text-[10px] font-mono flex items-start gap-2"
                    style={{ color: i === msgIndex ? accent : "#4b5563" }}
                  >
                    <span className="flex-shrink-0">{i === msgIndex ? "▶" : "✓"}</span>
                    {msg}
                  </motion.p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
