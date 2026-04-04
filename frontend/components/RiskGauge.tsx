"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  score: number; // 0–100
  verdict: "SAFE" | "SUSPICIOUS" | "FRAUD";
}

const verdictConfig = {
  SAFE: { color: "#00FF41", label: "SAFE", shadow: "0 0 30px rgba(0,255,65,0.5)" },
  SUSPICIOUS: { color: "#FFB800", label: "REVIEW", shadow: "0 0 30px rgba(255,184,0,0.5)" },
  FRAUD: { color: "#FF3131", label: "FRAUD", shadow: "0 0 30px rgba(255,49,49,0.6)" },
};

// Convert score 0–100 to SVG arc path
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const start = {
    x: cx + r * Math.cos(toRad(startAngle)),
    y: cy + r * Math.sin(toRad(startAngle)),
  };
  const end = {
    x: cx + r * Math.cos(toRad(endAngle)),
    y: cy + r * Math.sin(toRad(endAngle)),
  };
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function RiskGauge({ score, verdict }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const cfg = verdictConfig[verdict];

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(eased * score));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const cx = 100, cy = 100, r = 72;
  const startAngle = 150;
  const endAngle = startAngle + (animatedScore / 100) * 240;
  const trackEnd = startAngle + 240;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-36">
        <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible">
          {/* Track */}
          <path
            d={describeArc(cx, cy, r, startAngle, trackEnd)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Gradient arc segments (background zones) */}
          <defs>
            <linearGradient id="gaugeGrad" gradientUnits="userSpaceOnUse" x1="30" y1="100" x2="170" y2="100">
              <stop offset="0%" stopColor="#00FF41" />
              <stop offset="50%" stopColor="#FFB800" />
              <stop offset="100%" stopColor="#FF3131" />
            </linearGradient>
          </defs>
          {/* Filled arc */}
          {animatedScore > 0 && (
            <path
              d={describeArc(cx, cy, r, startAngle, endAngle)}
              fill="none"
              stroke={cfg.color}
              strokeWidth="10"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${cfg.color}80)` }}
            />
          )}
          {/* Needle dot */}
          {animatedScore > 0 && (
            <circle
              cx={cx + r * Math.cos(((endAngle) * Math.PI) / 180)}
              cy={cy + r * Math.sin(((endAngle) * Math.PI) / 180)}
              r="5"
              fill={cfg.color}
              style={{ filter: `drop-shadow(0 0 6px ${cfg.color})` }}
            />
          )}
          {/* Zone labels */}
          <text x="32" y="140" fill="#00FF41" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">SAFE</text>
          <text x="100" y="152" fill="#FFB800" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">REVIEW</text>
          <text x="168" y="140" fill="#FF3131" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">FRAUD</text>
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
          <motion.span
            className="text-4xl font-bold font-mono"
            style={{ color: cfg.color, textShadow: cfg.shadow }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.3 }}
          >
            {animatedScore}
          </motion.span>
          <span className="text-[10px] font-mono text-gray-600 mt-0.5">RISK SCORE</span>
        </div>
      </div>

      {/* Verdict badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-1 px-5 py-2 rounded-full font-mono font-bold text-sm"
        style={{
          color: cfg.color,
          backgroundColor: `${cfg.color}15`,
          border: `1px solid ${cfg.color}35`,
          boxShadow: `0 0 12px ${cfg.color}25`,
        }}
      >
        ● {cfg.label}
      </motion.div>
    </div>
  );
}
