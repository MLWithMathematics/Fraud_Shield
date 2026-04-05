// ============================================================
// lib/mockPredict.ts — API routing layer
// Real models call FastAPI. document-cnn stays mock.
// ============================================================

export interface PredictionInput {
  modelId: string;
  fields?: Record<string, string>;
  imageFile?: File;
}

export interface PredictionResult {
  riskScore:       number;
  verdict:         "SAFE" | "SUSPICIOUS" | "FRAUD";
  confidence:      number;
  reasoning:       string;
  topFactors:      Array<{ factor: string; contribution: string; direction: "up" | "down" }>;
  processingTime:  number;
  modelVersion:    string;
  gbmScore?:       number;
  lstmScore?:      number;
}

export interface CombinedResult {
  combinedScore: number;
  riskLevel:     "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  verdict:       "SAFE" | "SUSPICIOUS" | "FRAUD";
  weights:       { model1: number; model2: number; model3: number };
  model1:        PredictionResult;
  model2:        PredictionResult;
  model3:        PredictionResult;
  processingTime: number;
}

// Models that still use local mock logic
const MOCK_MODELS = new Set(["document-cnn"]);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Single model predict ──────────────────────────────────────
export async function predict(input: PredictionInput): Promise<PredictionResult> {
  if (!MOCK_MODELS.has(input.modelId)) {
    return callRealAPI(input);
  }
  await new Promise((r) => setTimeout(r, 2000));
  return mockDocumentCnn(input.imageFile);
}

// ── Combined Risk Engine ──────────────────────────────────────
export async function predictCombined(
  fields: Record<string, string>
): Promise<CombinedResult> {
  const parsed: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(fields)) {
    const n = Number(v);
    parsed[k] = isNaN(n) ? v : n;
  }
  const res = await fetch(`${API_BASE}/predict/combined`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
  });
  if (!res.ok) throw new Error(`Combined API error ${res.status}`);
  return res.json();
}

async function callRealAPI(input: PredictionInput): Promise<PredictionResult> {
  const parsed: Record<string, string | number> = {};
  if (input.fields) {
    for (const [k, v] of Object.entries(input.fields)) {
      const n = Number(v);
      parsed[k] = isNaN(n) ? v : n;
    }
  }
  const url = `${API_BASE}/predict/${input.modelId}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });
  } catch {
    throw new Error(
      `Cannot reach ${API_BASE}. Run: uvicorn main:app --reload --port 8000`
    );
  }
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

function scoreToVerdict(score: number): "SAFE" | "SUSPICIOUS" | "FRAUD" {
  if (score < 35) return "SAFE";
  if (score < 70) return "SUSPICIOUS";
  return "FRAUD";
}

function mockDocumentCnn(imageFile?: File): PredictionResult {
  void imageFile;
  const score = Math.round(20 + Math.random() * 75);
  return {
    riskScore: score, verdict: scoreToVerdict(score),
    confidence: 0.70 + Math.random() * 0.28,
    reasoning: "Document mock analysis result.",
    topFactors: [
      { factor: "JPEG DCT Anomaly", contribution: (Math.random() * 0.5).toFixed(3), direction: "up" },
      { factor: "Font Rendering", contribution: `${(88 + Math.random() * 12).toFixed(1)}%`, direction: "down" },
    ],
    processingTime: Math.round(60 + Math.random() * 40),
    modelVersion: "docforge-mock-v1.0",
  };
}
