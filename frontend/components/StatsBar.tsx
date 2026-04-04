"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 95,      suffix: "%+",  label: "Ensemble AUC",       decimals: 0, color: "#0052FF" },
  { value: 97,      suffix: "%",   label: "Hybrid AUC",          decimals: 0, color: "#00FF41" },
  { value: 590,     suffix: "K",   label: "Model 1 Train Rows",  decimals: 0, color: "#0052FF" },
  { value: 284.8,   suffix: "K",   label: "Model 2 Train Rows",  decimals: 1, color: "#00FF41" },
  { value: 3.5,     suffix: "%",   label: "IEEE-CIS Fraud Rate", decimals: 1, color: "#FFB800" },
  { value: 2,       suffix: "",    label: "Live ML Models",      decimals: 0, color: "#0052FF" },
];

function AnimatedNumber({
  value, suffix, decimals, color,
}: {
  value: number; suffix: string; decimals: number; color: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(eased * value);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref}>
      <span style={{ color }} className="text-3xl md:text-4xl font-bold font-mono">
        {display.toFixed(decimals)}
      </span>
      <span style={{ color }} className="text-xl font-mono font-bold">{suffix}</span>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0052FF]/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0052FF]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="text-center"
            >
              <AnimatedNumber
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals}
                color={stat.color}
              />
              <p className="text-xs text-gray-600 font-mono mt-1 uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
