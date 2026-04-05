"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, GitMerge } from "lucide-react";

const navLinks = [
  { href: "/",         label: "Home" },
  { href: "/gallery",  label: "Model Gallery" },
  { href: "/combined", label: "Risk Engine", highlight: true },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
    }`}>
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-[#0052FF] rounded-lg opacity-20 group-hover:opacity-40 transition-opacity blur-sm" />
            <div className="relative w-8 h-8 bg-[#0052FF]/10 border border-[#0052FF]/30 rounded-lg flex items-center justify-center group-hover:border-[#0052FF]/60 transition-colors">
              <Shield className="w-4 h-4 text-[#0052FF]" />
            </div>
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-wider" style={{ fontFamily: "'Syne', sans-serif" }}>
              FRAUD<span className="text-[#0052FF]">SHIELD</span>
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
              <span className="text-[10px] text-gray-500 font-mono">LIVE</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            if (link.highlight) {
              return (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-1"
                  style={active
                    ? { backgroundColor: "#0052FF", color: "#fff" }
                    : { backgroundColor: "rgba(0,82,255,0.12)", color: "#3378FF",
                        border: "1px solid rgba(0,82,255,0.25)" }}>
                  <GitMerge className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            }
            return (
              <Link key={link.href} href={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}>
                {active && (
                  <motion.div layoutId="nav-pill"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
            <div className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-white/5 text-white border border-white/10"
                      : "text-gray-500 hover:text-gray-300"
                  }`}>
                  {link.highlight && <GitMerge className="w-4 h-4 text-[#0052FF]" />}
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
