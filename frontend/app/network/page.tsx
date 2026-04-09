"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Network, RefreshCw, ZoomIn, ZoomOut, Maximize2,
  User, CreditCard, Laptop, Globe, ShoppingBag, AlertTriangle,
  Filter, Info, X,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
type NodeType = "account" | "transaction" | "device" | "ip" | "card" | "merchant";
type EdgeLabel = "owns" | "used_card" | "shared_device" | "shared_ip" | "purchased_at" | "linked_to";

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  risk: number;        // 0-100
  isSuspect: boolean;
  detail: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label: EdgeLabel;
  weight: number; // 1-3 (line thickness)
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── Node style helpers ────────────────────────────────────────────
const NODE_COLORS: Record<NodeType, string> = {
  account:     "#0052FF",
  transaction: "#FF3131",
  device:      "#00FF41",
  ip:          "#FFB800",
  card:        "#A855F7",
  merchant:    "#06B6D4",
};

const NODE_ICONS: Record<NodeType, string> = {
  account:     "👤",
  transaction: "💳",
  device:      "💻",
  ip:          "🌐",
  card:        "🃏",
  merchant:    "🛍️",
};

function riskColor(risk: number): string {
  if (risk >= 75) return "#FF3131";
  if (risk >= 50) return "#FFB800";
  if (risk >= 25) return "#00FF41";
  return "#6B7280";
}

// ── Demo fraud ring dataset ──────────────────────────────────────
function buildDemoGraph(ringIndex: number): GraphData {
  const rings: GraphData[] = [
    // Ring 1: Synthetic identity ring — 3 fake accounts sharing device + IP
    {
      nodes: [
        { id: "a1", label: "Account A-001",  type: "account",     risk: 88, isSuspect: true,  detail: "6 rapid transactions in 2h. Known synthetic ID pattern.", x: 400, y: 200, vx: 0, vy: 0, radius: 26 },
        { id: "a2", label: "Account A-002",  type: "account",     risk: 82, isSuspect: true,  detail: "Created same day as A-001. Shares device fingerprint.", x: 200, y: 150, vx: 0, vy: 0, radius: 26 },
        { id: "a3", label: "Account A-003",  type: "account",     risk: 79, isSuspect: true,  detail: "Third linked account on same IP subnet. Different email domain.", x: 600, y: 150, vx: 0, vy: 0, radius: 26 },
        { id: "a4", label: "Account A-107",  type: "account",     risk: 12, isSuspect: false, detail: "Legitimate account. Shares merchant only.", x: 400, y: 430, vx: 0, vy: 0, radius: 22 },
        { id: "d1", label: "Device D-4421",  type: "device",      risk: 91, isSuspect: true,  detail: "Chrome on Win10. Used by 3 suspect accounts. MAC: 00:1B:44:11:3A:B7", x: 400, y: 60,  vx: 0, vy: 0, radius: 22 },
        { id: "i1", label: "IP 185.220.x.x", type: "ip",          risk: 95, isSuspect: true,  detail: "Tor exit node. Associated with 14 fraud reports this month.", x: 180, y: 310, vx: 0, vy: 0, radius: 22 },
        { id: "c1", label: "Card •••• 7812", type: "card",        risk: 87, isSuspect: true,  detail: "Reported stolen. Used in 4 transactions across 2 accounts.", x: 620, y: 310, vx: 0, vy: 0, radius: 22 },
        { id: "t1", label: "Txn $4,850",     type: "transaction", risk: 88, isSuspect: true,  detail: "Combined score 88. 3am. Flagged by all 3 models.", x: 250, y: 380, vx: 0, vy: 0, radius: 20 },
        { id: "t2", label: "Txn $2,200",     type: "transaction", risk: 82, isSuspect: true,  detail: "Combined score 82. Overseas IP.", x: 560, y: 380, vx: 0, vy: 0, radius: 20 },
        { id: "m1", label: "Merchant M-11",  type: "merchant",    risk: 30, isSuspect: false, detail: "Online electronics retailer. Appears in multiple fraud rings.", x: 400, y: 520, vx: 0, vy: 0, radius: 20 },
      ],
      edges: [
        { source: "a1", target: "d1", label: "shared_device", weight: 3 },
        { source: "a2", target: "d1", label: "shared_device", weight: 3 },
        { source: "a3", target: "d1", label: "shared_device", weight: 3 },
        { source: "a1", target: "i1", label: "shared_ip",     weight: 2 },
        { source: "a2", target: "i1", label: "shared_ip",     weight: 2 },
        { source: "a3", target: "i1", label: "shared_ip",     weight: 2 },
        { source: "a1", target: "c1", label: "used_card",     weight: 2 },
        { source: "a2", target: "c1", label: "used_card",     weight: 2 },
        { source: "a1", target: "t1", label: "owns",          weight: 1 },
        { source: "a3", target: "t2", label: "owns",          weight: 1 },
        { source: "t1", target: "m1", label: "purchased_at",  weight: 1 },
        { source: "t2", target: "m1", label: "purchased_at",  weight: 1 },
        { source: "a4", target: "m1", label: "purchased_at",  weight: 1 },
        { source: "a1", target: "a2", label: "linked_to",     weight: 2 },
        { source: "a1", target: "a3", label: "linked_to",     weight: 2 },
      ],
    },
    // Ring 2: Card testing ring — single account, many small transactions
    {
      nodes: [
        { id: "b1", label: "Account B-991",  type: "account",     risk: 74, isSuspect: true,  detail: "23 micro-transactions in 90 minutes. Card-testing pattern.", x: 400, y: 250, vx: 0, vy: 0, radius: 26 },
        { id: "b2", label: "Account B-992",  type: "account",     risk: 62, isSuspect: true,  detail: "Same device as B-991. Created 3 days earlier.", x: 220, y: 180, vx: 0, vy: 0, radius: 24 },
        { id: "d2", label: "Device D-8801",  type: "device",      risk: 78, isSuspect: true,  detail: "Android mobile. Headless browser signatures detected.", x: 400, y: 80,  vx: 0, vy: 0, radius: 22 },
        { id: "i2", label: "IP 103.97.x.x",  type: "ip",          risk: 60, isSuspect: true,  detail: "Known datacenter IP. Multiple accounts originate here.", x: 220, y: 350, vx: 0, vy: 0, radius: 20 },
        { id: "i3", label: "IP 91.108.x.x",  type: "ip",          risk: 55, isSuspect: true,  detail: "VPN endpoint. 5 fraud-linked accounts in 30 days.", x: 580, y: 350, vx: 0, vy: 0, radius: 20 },
        { id: "c2", label: "Card •••• 3319", type: "card",        risk: 70, isSuspect: true,  detail: "Card used 23 times in 90 min for $0.99–$5.00 charges.", x: 600, y: 180, vx: 0, vy: 0, radius: 22 },
        { id: "t3", label: "Txn $0.99",      type: "transaction", risk: 65, isSuspect: true,  detail: "One of 23 micro-txns. Velocity spike detected.", x: 300, y: 450, vx: 0, vy: 0, radius: 18 },
        { id: "t4", label: "Txn $4.99",      type: "transaction", risk: 65, isSuspect: true,  detail: "Elevating amount pattern after card confirmed valid.", x: 500, y: 450, vx: 0, vy: 0, radius: 18 },
        { id: "m2", label: "Merchant M-55",  type: "merchant",    risk: 20, isSuspect: false, detail: "Digital goods platform. Common in card testing attacks.", x: 400, y: 530, vx: 0, vy: 0, radius: 20 },
      ],
      edges: [
        { source: "b1", target: "d2", label: "shared_device", weight: 3 },
        { source: "b2", target: "d2", label: "shared_device", weight: 3 },
        { source: "b1", target: "i2", label: "shared_ip",     weight: 2 },
        { source: "b2", target: "i3", label: "shared_ip",     weight: 2 },
        { source: "b1", target: "c2", label: "used_card",     weight: 3 },
        { source: "b1", target: "t3", label: "owns",          weight: 1 },
        { source: "b1", target: "t4", label: "owns",          weight: 1 },
        { source: "t3", target: "m2", label: "purchased_at",  weight: 1 },
        { source: "t4", target: "m2", label: "purchased_at",  weight: 1 },
        { source: "b1", target: "b2", label: "linked_to",     weight: 2 },
      ],
    },
  ];
  return rings[ringIndex % rings.length];
}

// ── Force simulation ─────────────────────────────────────────────
function applyForces(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number) {
  const k = 0.015;       // spring
  const repulsion = 5500; // node repulsion
  const damping = 0.82;
  const gravity = 0.003;

  const nodeMap: Record<string, GraphNode> = {};
  nodes.forEach((n) => (nodeMap[n.id] = n));

  // Reset forces
  nodes.forEach((n) => { n.vx *= damping; n.vy *= damping; });

  // Repulsion between nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x || 0.1;
      const dy = nodes[i].y - nodes[j].y || 0.1;
      const dist2 = dx * dx + dy * dy;
      const force = repulsion / dist2;
      nodes[i].vx += (dx / Math.sqrt(dist2)) * force;
      nodes[i].vy += (dy / Math.sqrt(dist2)) * force;
      nodes[j].vx -= (dx / Math.sqrt(dist2)) * force;
      nodes[j].vy -= (dy / Math.sqrt(dist2)) * force;
    }
  }

  // Spring along edges
  edges.forEach((e) => {
    const src = nodeMap[e.source];
    const tgt = nodeMap[e.target];
    if (!src || !tgt) return;
    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const targetDist = 120 + (src.radius + tgt.radius);
    const stretch = (dist - targetDist) * k;
    src.vx += (dx / dist) * stretch;
    src.vy += (dy / dist) * stretch;
    tgt.vx -= (dx / dist) * stretch;
    tgt.vy -= (dy / dist) * stretch;
  });

  // Gravity toward center
  nodes.forEach((n) => {
    n.vx += (width / 2 - n.x) * gravity;
    n.vy += (height / 2 - n.y) * gravity;
  });

  // Integrate
  const margin = 40;
  nodes.forEach((n) => {
    n.x = Math.max(margin + n.radius, Math.min(width - margin - n.radius, n.x + n.vx));
    n.y = Math.max(margin + n.radius, Math.min(height - margin - n.radius, n.y + n.vy));
  });
}

// ── Draw ─────────────────────────────────────────────────────────
function drawGraph(
  ctx: CanvasRenderingContext2D,
  nodes: GraphNode[],
  edges: GraphEdge[],
  hoveredId: string | null,
  selectedId: string | null,
  hiddenTypes: Set<NodeType>,
  highlightRing: boolean
) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);

  const visibleNodes = nodes.filter((n) => !hiddenTypes.has(n.type));
  const visibleIds = new Set(visibleNodes.map((n) => n.id));
  const nodeMap: Record<string, GraphNode> = {};
  visibleNodes.forEach((n) => (nodeMap[n.id] = n));

  // Draw edges
  edges.forEach((e) => {
    const src = nodeMap[e.source];
    const tgt = nodeMap[e.target];
    if (!src || !tgt) return;

    const isSuspectEdge = src.isSuspect && tgt.isSuspect;
    const isHighlighted = highlightRing && isSuspectEdge;
    const isConnected = selectedId && (e.source === selectedId || e.target === selectedId);

    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(tgt.x, tgt.y);
    ctx.lineWidth = isHighlighted ? e.weight * 2.5 : e.weight * 1.2;
    ctx.strokeStyle = isHighlighted
      ? "rgba(255, 49, 49, 0.7)"
      : isConnected
      ? "rgba(0, 82, 255, 0.6)"
      : "rgba(255, 255, 255, 0.08)";
    ctx.stroke();

    // Edge label
    if (isConnected || isHighlighted) {
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.textAlign = "center";
      ctx.fillText(e.label.replace("_", " "), mx, my - 4);
    }
  });

  // Draw nodes
  visibleNodes.forEach((n) => {
    const color = NODE_COLORS[n.type];
    const isHovered = n.id === hoveredId;
    const isSelected = n.id === selectedId;
    const inRing = highlightRing && n.isSuspect;

    // Outer glow
    if (inRing || isHovered || isSelected) {
      const grad = ctx.createRadialGradient(n.x, n.y, n.radius * 0.5, n.x, n.y, n.radius * 2.5);
      const glowColor = inRing ? "#FF3131" : isSelected ? "#0052FF" : color;
      grad.addColorStop(0, glowColor + "50");
      grad.addColorStop(1, glowColor + "00");
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Node body
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
    ctx.fillStyle = color + "22";
    ctx.fill();
    ctx.strokeStyle = inRing ? "#FF3131" : isSelected ? "#0052FF" : color;
    ctx.lineWidth = isHovered || isSelected ? 2.5 : 1.5;
    ctx.stroke();

    // Risk ring
    if (n.risk > 0) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius + 4, -Math.PI / 2, -Math.PI / 2 + (n.risk / 100) * 2 * Math.PI);
      ctx.strokeStyle = riskColor(n.risk) + "90";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Icon text
    ctx.font = `${n.radius * 0.9}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(NODE_ICONS[n.type], n.x, n.y);

    // Label below
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = isHovered || isSelected ? "#fff" : "rgba(255,255,255,0.65)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(n.label, n.x, n.y + n.radius + 5);
  });
}

// ── Main Page ────────────────────────────────────────────────────
export default function NetworkPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const nodesRef  = useRef<GraphNode[]>([]);
  const edgesRef  = useRef<GraphEdge[]>([]);
  const dragRef   = useRef<{ id: string; ox: number; oy: number } | null>(null);

  const [hovered,     setHovered]     = useState<GraphNode | null>(null);
  const [selected,    setSelected]    = useState<GraphNode | null>(null);
  const [ringIndex,   setRingIndex]   = useState(0);
  const [hiddenTypes, setHiddenTypes] = useState<Set<NodeType>>(new Set());
  const [highlight,   setHighlight]   = useState(false);
  const [zoom,        setZoom]        = useState(1);
  const [canvasSize,  setCanvasSize]  = useState({ w: 800, h: 560 });

  const RING_NAMES = ["Synthetic Identity Ring", "Card Testing Ring"];

  const loadRing = useCallback((idx: number) => {
    const data = buildDemoGraph(idx);
    // Scatter nodes randomly around center
    const CX = canvasSize.w / 2;
    const CY = canvasSize.h / 2;
    data.nodes.forEach((n) => {
      n.x = CX + (Math.random() - 0.5) * 300;
      n.y = CY + (Math.random() - 0.5) * 240;
      n.vx = (Math.random() - 0.5) * 2;
      n.vy = (Math.random() - 0.5) * 2;
    });
    nodesRef.current = data.nodes;
    edgesRef.current = data.edges;
    setSelected(null);
    setHovered(null);
  }, [canvasSize]);

  useEffect(() => { loadRing(ringIndex); }, [ringIndex, loadRing]);

  // Resize observer
  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.floor(e.contentRect.width);
        const h = Math.max(480, Math.floor(e.contentRect.height));
        setCanvasSize({ w, h });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;
    const loop = () => {
      frameCount++;
      // Slow down simulation over time
      if (frameCount < 300) {
        applyForces(nodesRef.current, edgesRef.current, canvasSize.w, canvasSize.h);
      }
      drawGraph(
        ctx,
        nodesRef.current,
        edgesRef.current,
        hovered?.id ?? null,
        selected?.id ?? null,
        hiddenTypes,
        highlight
      );
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [hovered, selected, hiddenTypes, highlight, canvasSize]);

  // Mouse helpers
  function getNodeAt(x: number, y: number): GraphNode | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const cx = (x - rect.left) / zoom;
    const cy = (y - rect.top) / zoom;
    return (
      nodesRef.current.find((n) => {
        const dx = n.x - cx;
        const dy = n.y - cy;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
      }) ?? null
    );
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const node = getNodeAt(e.clientX, e.clientY);
    setHovered(node);
    if (dragRef.current) {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / zoom;
      const cy = (e.clientY - rect.top) / zoom;
      const n = nodesRef.current.find((x) => x.id === dragRef.current!.id);
      if (n) { n.x = cx; n.y = cy; n.vx = 0; n.vy = 0; }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const node = getNodeAt(e.clientX, e.clientY);
    if (node) {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      dragRef.current = {
        id: node.id,
        ox: (e.clientX - rect.left) / zoom - node.x,
        oy: (e.clientY - rect.top) / zoom - node.y,
      };
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragRef.current) {
      const node = getNodeAt(e.clientX, e.clientY);
      setSelected(node?.id === selected?.id ? null : node);
    }
    dragRef.current = null;
  };

  const toggleType = (type: NodeType) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const nodeTypes: NodeType[] = ["account", "transaction", "device", "ip", "card", "merchant"];

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-2">Agency Tools</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-extrabold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                Network Graph
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Visualize fraud rings — shared devices, IP addresses, cards, and account clusters.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setRingIndex((r) => (r + 1) % RING_NAMES.length); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-xs font-mono text-gray-400 hover:text-white transition-colors border border-white/8"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Next Ring
              </button>
              <button
                onClick={() => setHighlight((h) => !h)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all border ${
                  highlight
                    ? "bg-[#FF3131]/10 border-[#FF3131]/30 text-[#FF3131]"
                    : "glass-card border-white/8 text-gray-400 hover:text-white"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {highlight ? "Ring Highlighted" : "Detect Ring"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Ring selector */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-3 mb-6">
          {RING_NAMES.map((name, idx) => (
            <button
              key={idx}
              onClick={() => setRingIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all border ${
                ringIndex === idx
                  ? "bg-[#0052FF]/12 border-[#0052FF]/35 text-[#3378FF]"
                  : "glass-card border-white/8 text-gray-500 hover:text-gray-300"
              }`}
            >
              {name}
            </button>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">

          {/* Canvas */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl overflow-hidden relative"
            style={{ minHeight: 520 }}
          >
            {/* Toolbar */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#0052FF]/15 border border-[#0052FF]/25 text-[#3378FF]">
                {RING_NAMES[ringIndex]}
              </span>
              <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-black/40 border border-white/8 text-gray-500">
                {nodesRef.current.length} nodes · {edgesRef.current.length} edges
              </span>
            </div>
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
              <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/40 border border-white/8 text-gray-500 hover:text-white transition-colors">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/40 border border-white/8 text-gray-500 hover:text-white transition-colors">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <canvas
              ref={canvasRef}
              width={canvasSize.w}
              height={canvasSize.h}
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left", cursor: hovered ? "pointer" : "default" }}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => { setHovered(null); dragRef.current = null; }}
            />

            {/* Interaction hint */}
            <div className="absolute bottom-3 left-3 text-[10px] font-mono text-gray-700">
              Click node to inspect · Drag to reposition · Click &quot;Detect Ring&quot; to highlight suspicious clusters
            </div>
          </motion.div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Type filter */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-4">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Filter className="w-3 h-3" />Node Types
              </p>
              <div className="space-y-1.5">
                {nodeTypes.map((type) => {
                  const hidden = hiddenTypes.has(type);
                  const color = NODE_COLORS[type];
                  const count = nodesRef.current.filter((n) => n.type === type).length;
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${hidden ? "opacity-40" : ""}`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: hidden ? "#374151" : color }} />
                      <span className="text-[11px] font-mono text-gray-300 flex-1 capitalize">{type}</span>
                      <span className="text-[10px] font-mono text-gray-600">{count}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Selected node detail */}
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Node Detail</p>
                  <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{NODE_ICONS[selected.type]}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{selected.label}</p>
                      <p className="text-[10px] font-mono capitalize" style={{ color: NODE_COLORS[selected.type] }}>
                        {selected.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-600">Risk Score</span>
                    <span className="text-sm font-mono font-bold" style={{ color: riskColor(selected.risk) }}>{selected.risk}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${selected.risk}%`, backgroundColor: riskColor(selected.risk) }} />
                    </div>
                  </div>
                  {selected.isSuspect && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF3131] bg-[#FF3131]/8 rounded-lg px-2.5 py-1.5 border border-[#FF3131]/20">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      Suspect node — part of fraud ring
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500 leading-relaxed pt-1">{selected.detail}</p>

                  {/* Connected edges */}
                  <div className="pt-2">
                    <p className="text-[10px] font-mono text-gray-700 mb-1.5">Connections</p>
                    <div className="space-y-1">
                      {edgesRef.current
                        .filter((e) => e.source === selected.id || e.target === selected.id)
                        .map((e, i) => {
                          const otherId = e.source === selected.id ? e.target : e.source;
                          const other = nodesRef.current.find((n) => n.id === otherId);
                          return (
                            <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
                              <span className="text-gray-700">→</span>
                              <span className="text-gray-500">{other?.label ?? otherId}</span>
                              <span className="text-gray-700 italic">{e.label.replace("_"," ")}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="rounded-xl p-4 bg-[#0052FF]/6 border border-[#0052FF]/15">
                <p className="text-[11px] font-mono text-[#3378FF] leading-relaxed">
                  Click any node to see its risk score, connections, and investigation detail. Use <strong>Detect Ring</strong> to highlight the fraud cluster in red.
                </p>
              </motion.div>
            )}

            {/* Legend */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              className="glass-card rounded-2xl p-4">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">Risk Legend</p>
              <div className="space-y-1.5">
                {[
                  { range: "75–100", label: "Critical",  color: "#FF3131" },
                  { range: "50–74",  label: "High",      color: "#FFB800" },
                  { range: "25–49",  label: "Medium",    color: "#00FF41" },
                  { range: "0–24",   label: "Low",       color: "#6B7280" },
                ].map((r) => (
                  <div key={r.range} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-[10px] font-mono text-gray-500">{r.label}</span>
                    <span className="text-[10px] font-mono text-gray-700 ml-auto">{r.range}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 text-[9px] font-mono text-gray-700 leading-relaxed">
                Arc around each node = risk percentage. Full arc = 100%.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
