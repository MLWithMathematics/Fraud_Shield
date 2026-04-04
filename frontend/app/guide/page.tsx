"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileCode2,
  Server,
  Zap,
  Map,
  GitBranch,
  CheckCircle2,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  Database,
  Layers,
} from "lucide-react";

// ── Copy button helper ─────────────────────────────────────────
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all"
    >
      {copied ? <Check className="w-3 h-3 text-[#00FF41]" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Code block ─────────────────────────────────────────────────
function CodeBlock({ code, lang = "ts" }: { code: string; lang?: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/7 bg-[#080808] my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-[10px] font-mono text-gray-600 uppercase">{lang}</span>
        <CopyButton code={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-xs font-mono text-gray-400 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  step,
  title,
  accent = "#0052FF",
}: {
  icon: React.ElementType;
  step: string;
  title: string;
  accent?: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: accent }}>
          {step}
        </p>
        <h2
          className="text-2xl font-bold text-white mt-0.5"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

// ── Checkmark list ─────────────────────────────────────────────
function CheckList({ items, accent = "#00FF41" }: { items: string[]; accent?: string }) {
  return (
    <ul className="space-y-2 mt-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accent }} />
          <span className="text-sm text-gray-500 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ──────────────────────────────────────────────────────────────
const MODEL_ENTRY_CODE = `// config/models.ts

export const models: ModelConfig[] = [
  // ... existing models ...

  {
    id: "my-new-model",            // ← URL: /test/my-new-model
    name: "My New Model",
    type: "numeric",               // or "image"
    tagline: "Short one-liner description.",
    description: "Full description shown on the test page.",
    techStack: ["LightGBM", "Optuna", "FastAPI"],
    category: "Wire Transfer Fraud",
    architecture: "Architecture notes…",
    inputFields: [
      { name: "amount", label: "Amount ($)", placeholder: "e.g. 500", type: "number" },
      { name: "risk_score", label: "Risk Score", placeholder: "e.g. 0.7", type: "number" },
    ],
    stats: [
      { label: "Accuracy", value: "98.5%", highlight: true },
      { label: "Latency",  value: "< 20ms" },
    ],
    chartType: "precision-recall",  // or "shap"
    chartData: [                    // Your actual curve data
      { recall: 0.0, precision: 1.0 },
      { recall: 0.5, precision: 0.92 },
      { recall: 1.0, precision: 0.25 },
    ],
    color: "blue",                  // "blue" | "green" | "red"
  },
];`;

const MOCK_PREDICT_CODE = `// lib/mockPredict.ts — add a case for your new model

export async function predict(input: PredictionInput): Promise<PredictionResult> {
  await new Promise((r) => setTimeout(r, 2000)); // Remove in production

  switch (input.modelId) {
    case "my-new-model":
      return mockMyNewModel(input.fields ?? {});
    // ... existing cases
  }
}

function mockMyNewModel(fields: Record<string, string>): PredictionResult {
  const amount = parseFloat(fields.amount ?? "0");
  const score = amount > 5000 ? 85 : 12;
  return {
    riskScore: score,
    verdict: score > 70 ? "FRAUD" : "SAFE",
    confidence: 0.92,
    reasoning: "Explanation of why this was flagged.",
    topFactors: [
      { factor: "Amount", contribution: \`$\${amount}\`, direction: "up" },
    ],
    processingTime: 14,
    modelVersion: "lgbm-v1.0.0",
  };
}`;

const FASTAPI_CODE = `# Python FastAPI endpoint (backend/main.py)
from fastapi import FastAPI
from pydantic import BaseModel
import joblib, numpy as np

app = FastAPI()
model = joblib.load("models/transaction_xgb.pkl")

class TransactionRequest(BaseModel):
    amount: float
    v1: float
    v2: float
    hour: int

@app.post("/predict/transaction-xgb")
def predict(req: TransactionRequest):
    X = np.array([[req.amount, req.v1, req.v2, req.hour]])
    prob = float(model.predict_proba(X)[0][1])
    score = int(prob * 100)
    return {
        "riskScore": score,
        "verdict": "FRAUD" if score > 70 else "SUSPICIOUS" if score > 35 else "SAFE",
        "confidence": prob,
        "reasoning": f"Probability {prob:.3f} from XGBoost ensemble.",
        "topFactors": [],
        "processingTime": 12,
        "modelVersion": "xgb-v2.4.1"
    }`;

const FETCH_REPLACE_CODE = `// lib/mockPredict.ts — replace the switch block with:

export async function predict(input: PredictionInput): Promise<PredictionResult> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  if (input.modelId === "document-cnn" && input.imageFile) {
    // Image model: multipart upload
    const form = new FormData();
    form.append("file", input.imageFile);
    const res = await fetch(\`\${BASE_URL}/predict/document-cnn\`, {
      method: "POST",
      body: form,
    });
    return res.json();
  }

  // Numeric models: JSON POST
  const res = await fetch(\`\${BASE_URL}/predict/\${input.modelId}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: input.fields }),
  });
  return res.json();
}`;

const ENV_CODE = `# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# For production:
# NEXT_PUBLIC_API_URL=https://your-api.fly.dev`;

// ──────────────────────────────────────────────────────────────
export default function GuidePage() {
  const TOC = [
    { id: "add-model", label: "Add a New Model" },
    { id: "connect-backend", label: "Connect FastAPI" },
    { id: "future", label: "Future Improvements" },
    { id: "architecture", label: "System Architecture" },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[240px_1fr] gap-12">
          {/* Sidebar TOC */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-4">
                On This Page
              </p>
              <nav className="space-y-1">
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-300 transition-colors py-1.5 px-3 rounded-lg hover:bg-white/3 font-mono"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-8 p-4 rounded-xl bg-[#0052FF]/5 border border-[#0052FF]/15">
                <p className="text-xs font-mono text-[#0052FF] mb-2 font-bold">Quick Tip</p>
                <p className="text-[11px] text-gray-600 leading-relaxed font-mono">
                  The entire UI is driven by{" "}
                  <code className="text-[#0052FF]">config/models.ts</code>. You never need to touch a page component to add a new model.
                </p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <p className="text-xs font-mono text-[#0052FF] uppercase tracking-[0.3em] mb-3">
                Developer Documentation
              </p>
              <h1
                className="text-4xl md:text-5xl font-extrabold text-white mb-4"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Integration &amp;
                <br />
                Modification Guide
              </h1>
              <p className="text-gray-500 leading-relaxed max-w-2xl">
                This guide explains how to extend FraudShield AI — adding new models, wiring up a real Python backend, and planning production-grade improvements. Written for the developer who built this.
              </p>
            </motion.div>

            {/* ── STEP 1: Add a model ─────────────────────────── */}
            <motion.section
              id="add-model"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <SectionHeader
                icon={FileCode2}
                step="Step 01"
                title="Add a New Model"
                accent="#0052FF"
              />

              <div className="glass-card rounded-2xl p-6 space-y-4">
                <p className="text-sm text-gray-500 leading-relaxed">
                  The entire UI — Gallery cards, navigation links, Testing Lab forms, and Deep-Dive charts — is generated dynamically from a single file:{" "}
                  <code className="text-[#0052FF] font-mono text-xs bg-[#0052FF]/10 px-1.5 py-0.5 rounded">
                    config/models.ts
                  </code>
                  . To add a new model, you only touch this file and (optionally){" "}
                  <code className="text-xs font-mono text-gray-400">lib/mockPredict.ts</code>.
                </p>

                <div className="p-4 rounded-xl bg-[#00FF41]/5 border border-[#00FF41]/15">
                  <p className="text-xs font-mono text-[#00FF41] font-bold mb-2">
                    2-file addition checklist:
                  </p>
                  <CheckList
                    items={[
                      "Open config/models.ts and append a new object to the models array.",
                      "Set a unique id (becomes the URL: /test/[id]).",
                      "Set type: 'numeric' for structured input or 'image' for document upload.",
                      "Populate inputFields[] (only needed for numeric type).",
                      "Add chart data for the deep-dive visualization.",
                      "Open lib/mockPredict.ts and add a case for your model id in the switch block.",
                    ]}
                    accent="#00FF41"
                  />
                </div>

                <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mt-4">
                  config/models.ts — new entry
                </p>
                <CodeBlock code={MODEL_ENTRY_CODE} lang="typescript" />

                <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mt-4">
                  lib/mockPredict.ts — add mock handler
                </p>
                <CodeBlock code={MOCK_PREDICT_CODE} lang="typescript" />
              </div>
            </motion.section>

            {/* ── STEP 2: Connect FastAPI ─────────────────────── */}
            <motion.section
              id="connect-backend"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <SectionHeader
                icon={Server}
                step="Step 02"
                title="Connect a FastAPI Backend"
                accent="#00FF41"
              />

              <div className="glass-card rounded-2xl p-6 space-y-4">
                <p className="text-sm text-gray-500 leading-relaxed">
                  All mock logic lives in{" "}
                  <code className="font-mono text-xs text-gray-300">lib/mockPredict.ts</code>.
                  The{" "}
                  <code className="font-mono text-xs text-gray-300">predict()</code> function is the single integration seam — replace its internals with real{" "}
                  <code className="font-mono text-xs text-gray-300">fetch()</code> calls to your FastAPI endpoints. The UI components are unchanged.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/3 border border-white/7">
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">
                      <Terminal className="w-3.5 h-3.5 inline mr-1.5" />
                      Step A — Build the endpoint
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Create a POST route in FastAPI that receives your model inputs and returns the{" "}
                      <code className="text-gray-400">PredictionResult</code> JSON schema.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/3 border border-white/7">
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">
                      <Database className="w-3.5 h-3.5 inline mr-1.5" />
                      Step B — Set env var
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Add <code className="text-gray-400">NEXT_PUBLIC_API_URL</code> to your{" "}
                      <code className="text-gray-400">.env.local</code>, pointing at your running FastAPI server.
                    </p>
                  </div>
                </div>

                <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
                  Python — FastAPI endpoint
                </p>
                <CodeBlock code={FASTAPI_CODE} lang="python" />

                <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
                  .env.local
                </p>
                <CodeBlock code={ENV_CODE} lang="bash" />

                <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
                  lib/mockPredict.ts — replace with real fetch()
                </p>
                <CodeBlock code={FETCH_REPLACE_CODE} lang="typescript" />

                <div className="p-4 rounded-xl bg-[#FFB800]/5 border border-[#FFB800]/15">
                  <p className="text-xs font-mono text-[#FFB800] font-bold mb-2">
                    ⚠ CORS Configuration
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed font-mono">
                    Add <code className="text-gray-400">fastapi.middleware.cors.CORSMiddleware</code> to your FastAPI app and allow <code className="text-gray-400">http://localhost:3000</code> (or your production domain) as an origin.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* ── STEP 3: Future improvements ─────────────────── */}
            <motion.section
              id="future"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <SectionHeader
                icon={Zap}
                step="Step 03"
                title="Future Improvements"
                accent="#FF3131"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: Layers,
                    title: "XAI Integration",
                    accent: "#0052FF",
                    description:
                      "Replace static SHAP chart data with live SHAP values returned per-prediction from your FastAPI endpoint. Add a waterfall chart showing each feature's exact contribution to a specific decision.",
                    tags: ["SHAP", "LIME", "Anchors"],
                  },
                  {
                    icon: Map,
                    title: "Live Transaction Maps",
                    accent: "#00FF41",
                    description:
                      "Integrate Mapbox or deck.gl to render a real-time globe of incoming transactions. Flag fraudulent transactions as red spikes on the map. Filterable by model and verdict.",
                    tags: ["Mapbox", "deck.gl", "WebSockets"],
                  },
                  {
                    icon: GitBranch,
                    title: "Human Feedback Loops",
                    accent: "#FFB800",
                    description:
                      "Add thumbs up/down feedback buttons to each Security Report. Store corrections in a Postgres table. Retrain models weekly using active learning with corrected labels.",
                    tags: ["Active Learning", "Postgres", "MLflow"],
                  },
                  {
                    icon: Terminal,
                    title: "Model Versioning & A/B Testing",
                    accent: "#FF3131",
                    description:
                      "Use MLflow Model Registry to version artifacts. Shadow-deploy new model versions alongside production, comparing risk score distributions before full rollout.",
                    tags: ["MLflow", "Shadow Mode", "Canary"],
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="glass-card rounded-2xl p-5 card-hover">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${item.accent}15`, border: `1px solid ${item.accent}30` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: item.accent }} />
                        </div>
                        <h3
                          className="text-sm font-bold text-white mt-1"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                            style={{
                              color: item.accent,
                              backgroundColor: `${item.accent}10`,
                              border: `1px solid ${item.accent}20`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* ── System architecture diagram ──────────────────── */}
            <motion.section
              id="architecture"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="scroll-mt-24"
            >
              <SectionHeader
                icon={Layers}
                step="Reference"
                title="System Architecture"
                accent="#0052FF"
              />

              <div className="glass-card rounded-2xl p-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    {
                      layer: "Frontend",
                      tech: "Next.js 14 + Tailwind",
                      items: ["Config-driven UI from models.ts", "Framer Motion animations", "Recharts visualizations", "Dynamic /test/[modelId] routes"],
                      color: "#0052FF",
                    },
                    {
                      layer: "API Layer",
                      tech: "FastAPI (Python)",
                      items: ["POST /predict/{model_id}", "Multipart for image models", "JSON for numeric models", "CORS + Auth middleware"],
                      color: "#00FF41",
                    },
                    {
                      layer: "ML Backend",
                      tech: "scikit-learn / PyTorch",
                      items: ["Serialized model artifacts", "SHAP explainer objects", "MLflow experiment tracking", "Feature preprocessing pipelines"],
                      color: "#FF3131",
                    },
                  ].map((col) => (
                    <div
                      key={col.layer}
                      className="rounded-xl p-4 border"
                      style={{ borderColor: `${col.color}20`, backgroundColor: `${col.color}05` }}
                    >
                      <p
                        className="text-[10px] font-mono uppercase tracking-widest mb-1"
                        style={{ color: col.color }}
                      >
                        {col.layer}
                      </p>
                      <p className="text-xs font-bold text-white mb-3">{col.tech}</p>
                      <ul className="space-y-1.5">
                        {col.items.map((item) => (
                          <li key={item} className="flex items-start gap-1.5">
                            <div
                              className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: col.color }}
                            />
                            <span className="text-[11px] text-gray-600 leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4 text-[11px] font-mono text-gray-700">
                  <span>Browser → Next.js (Vercel)</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>fetch() → FastAPI (Fly.io / Railway)</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>joblib.load() → Pickle / ONNX</span>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
