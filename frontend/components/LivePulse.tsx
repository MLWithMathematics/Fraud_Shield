"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Transaction {
  id: number;
  amount: string;
  merchant: string;
  status: "safe" | "suspicious" | "fraud";
  time: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, amount: "$24.99", merchant: "Amazon.com", status: "safe", time: "just now" },
  { id: 2, amount: "$4,200.00", merchant: "Wire Transfer", status: "fraud", time: "2s ago" },
  { id: 3, amount: "$89.50", merchant: "Uber Eats", status: "safe", time: "4s ago" },
  { id: 4, amount: "$2,800.00", merchant: "Crypto Exchange", status: "suspicious", time: "6s ago" },
  { id: 5, amount: "$12.99", merchant: "Netflix", status: "safe", time: "9s ago" },
  { id: 6, amount: "$8,500.00", merchant: "Unknown Merchant", status: "fraud", time: "12s ago" },
  { id: 7, amount: "$340.00", merchant: "Best Buy", status: "safe", time: "15s ago" },
];

const statusConfig = {
  safe: { color: "#00FF41", label: "SAFE", bg: "rgba(0,255,65,0.08)" },
  suspicious: { color: "#FFB800", label: "REVIEW", bg: "rgba(255,184,0,0.08)" },
  fraud: { color: "#FF3131", label: "BLOCKED", bg: "rgba(255,49,49,0.08)" },
};

export default function LivePulse() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS.slice(0, 5));
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((c) => c + 1);
      setTransactions((prev) => {
        const newTx: Transaction = {
          ...MOCK_TRANSACTIONS[counter % MOCK_TRANSACTIONS.length],
          id: Date.now(),
          time: "just now",
        };
        return [newTx, ...prev.slice(0, 4)];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [counter]);

  return (
    <div className="relative w-full max-w-sm">
      {/* Pulse circle */}
      <div className="absolute -top-4 -right-4 z-10">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#00FF41]/20 pulse-ring" />
          <div className="absolute inset-2 rounded-full bg-[#00FF41]/30 pulse-ring" style={{ animationDelay: "0.5s" }} />
          <div className="w-4 h-4 rounded-full bg-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.8)]" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Live Transaction Stream</span>
        </div>
        <span className="text-xs font-mono text-gray-600">
          {transactions.length} / 1k shown
        </span>
      </div>

      {/* Transaction list */}
      <div className="relative overflow-hidden rounded-xl border border-white/7 bg-[#0f0f0f]">
        {/* Scan line */}
        <div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0052FF]/40 to-transparent pointer-events-none z-10 scan-line"
        />

        <div className="divide-y divide-white/5">
          {transactions.map((tx, i) => {
            const cfg = statusConfig[tx.status];
            return (
              <motion.div
                key={tx.id}
                initial={i === 0 ? { opacity: 0, y: -20, backgroundColor: "rgba(0,82,255,0.1)" } : { opacity: 1 }}
                animate={{ opacity: 1, y: 0, backgroundColor: "transparent" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex items-center justify-between px-4 py-3 gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-1.5 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cfg.color, boxShadow: `0 0 8px ${cfg.color}80` }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 truncate font-medium">{tx.merchant}</p>
                    <p className="text-xs text-gray-600 font-mono">{tx.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-mono text-gray-300">{tx.amount}</span>
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}30` }}
                  >
                    {cfg.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { label: "Processed", value: "12.4k/s", color: "#0052FF" },
          { label: "Flagged", value: "0.8%", color: "#FFB800" },
          { label: "Blocked", value: "23", color: "#FF3131" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-lg px-3 py-2 text-center">
            <p className="text-xs font-mono font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px] text-gray-600 font-mono mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
