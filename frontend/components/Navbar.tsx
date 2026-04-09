"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Menu, X, GitMerge, BookOpen, Bell, Folder,
  BarChart3, ChevronDown, Upload, ChevronRight,
} from "lucide-react";
import { getAlerts } from "@/lib/caseStore";

// ── Agency tools dropdown ─────────────────────────────────────────
const AGENCY_LINKS = [
  { href: "/alerts",      label: "Alert Queue",      icon: Bell,     desc: "Live transaction feed",       color: "#FF3131" },
  { href: "/cases",       label: "Case Management",  icon: Folder,   desc: "Investigate & resolve cases", color: "#0052FF" },
  { href: "/batch",       label: "Batch Mode",       icon: Upload,   desc: "Score transactions in bulk",  color: "#00FF41" },
  { href: "/performance", label: "Performance",      icon: BarChart3, desc: "Model metrics & feedback",   color: "#A855F7" },
];

const PRIMARY_LINKS = [
  { href: "/",         label: "Home",         highlight: false },
  { href: "/gallery",  label: "Model Gallery", highlight: false },
  { href: "/combined", label: "Risk Engine",  highlight: true, icon: GitMerge },
];

// ── Dropdown for Agency Tools ──────────────────────────────────────
function AgencyDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = AGENCY_LINKS.some((l) => pathname === l.href);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    try {
      const count = getAlerts().filter((a) => !a.acknowledged).length;
      setUnread(count);
    } catch {}
    const interval = setInterval(() => {
      try { setUnread(getAlerts().filter((a) => !a.acknowledged).length); } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive || open ? "text-white bg-white/5 border border-white/10" : "text-gray-500 hover:text-gray-300"
        }`}
      >
        Agency Tools
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF3131] text-[9px] text-white font-mono font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 w-64 rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="p-1">
              {AGENCY_LINKS.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                      active ? "bg-white/8" : "hover:bg-white/5"
                    }`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${link.color}12`, border: `1px solid ${link.color}20` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: link.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{link.label}</p>
                        {link.href === "/alerts" && unread > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#FF3131] text-[9px] text-white font-mono font-bold">{unread}</span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-gray-600">{link.desc}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 ml-auto flex-shrink-0 transition-colors" />
                  </Link>
                );
              })}
            </div>
            <div className="px-4 py-2 border-t border-white/5">
              <p className="text-[10px] font-mono text-gray-700">FraudShield Agency Suite</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Navbar ────────────────────────────────────────────────────
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
          {/* Primary links */}
          {PRIMARY_LINKS.map((link) => {
            const active = pathname === link.href;
            const NavIcon = link.icon;

            if (link.highlight) {
              return (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-1"
                  style={active
                    ? { backgroundColor: "#0052FF", color: "#fff" }
                    : { backgroundColor: "rgba(0,82,255,0.12)", color: "#3378FF", border: "1px solid rgba(0,82,255,0.25)" }}>
                  {NavIcon && <NavIcon className="w-3.5 h-3.5" />}
                  {link.label}
                </Link>
              );
            }
            return (
              <Link key={link.href} href={link.href}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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

          {/* Agency tools dropdown */}
          <AgencyDropdown pathname={pathname} />

          {/* How To Use */}
          <Link href="/how-to-use"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === "/how-to-use" ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}>
            <BookOpen className="w-3.5 h-3.5" />
          </Link>
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
              {[...PRIMARY_LINKS, ...AGENCY_LINKS, { href: "/how-to-use", label: "How To Use", highlight: false }].map((link) => {
                const NavIcon = (link as { icon?: React.ElementType }).icon;
                const active = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active ? "bg-white/5 text-white border border-white/10" : "text-gray-500 hover:text-gray-300"
                    }`}>
                    {NavIcon && <NavIcon className="w-4 h-4" style={{ color: (link as { color?: string }).color || ((link as { highlight?: boolean }).highlight ? "#0052FF" : undefined) }} />}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
