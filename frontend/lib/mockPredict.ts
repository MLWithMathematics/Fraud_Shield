// ============================================================
// lib/mockPredict.ts
//
// Routing layer between the Testing Lab UI and the backend.
//
// HOW IT WORKS:
//   - Models with a real backend entry below call fetch() to FastAPI.
//   - Models still in MOCK_MODELS use local simulation (no backend needed).
//
// TO CONNECT A NEW MODEL:
//   1. Remove its id from MOCK_MODELS set below.
//   2. That's it — it will automatically use the real API.
// ============================================================

export interface PredictionInput {
  modelId: string;
  fields?: Record<string, string>;
  imageFile?: File;
}

export interface PredictionResult {
  riskScore: number;           // 0–100
  verdict: "SAFE" | "SUSPICIOUS" | "FRAUD";
  confidence: number;          // 0.0–1.0
  reasoning: string;
  topFactors: Array<{
    factor: string;
    contribution: string;
    direction: "up" | "down";
  }>;
  processingTime: number;      // milliseconds
  modelVersion: string;
}

// ── Models that still use local mock logic (no FastAPI needed) ────────────────
// Remove a model id from here when you wire it up to a real backend.
const MOCK_MODELS = new Set(["document-cnn"]);

// ── FastAPI base URL — set in .env.local ─────────────────────────────────────
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ================================================================
// MAIN PREDICT FUNCTION
// Called by the Testing Lab UI for every model.
// ================================================================
export async function predict(input: PredictionInput): Promise<PredictionResult> {

  // ── Real API path ──────────────────────────────────────────────────────────
  if (!MOCK_MODELS.has(input.modelId)) {
    return callRealAPI(input);
  }

  // ── Mock path (document-cnn and any model still in MOCK_MODELS) ────────────
  await new Promise((r) => setTimeout(r, 2000)); // simulate inference delay
  return mockDocumentCnn(input.imageFile);
}


// ================================================================
// REAL API CALLER
// Sends form fields as JSON to FastAPI.
// FastAPI response must match the PredictionResult shape above.
// ================================================================
async function callRealAPI(input: PredictionInput): Promise<PredictionResult> {

  // Convert string field values to numbers where possible
  // (HTML form inputs always come in as strings)
  const parsedFields: Record<string, string | number> = {};
  if (input.fields) {
    for (const [key, val] of Object.entries(input.fields)) {
      const num = Number(val);
      parsedFields[key] = isNaN(num) ? val : num;
    }
  }

  const url = `${API_BASE}/predict/${input.modelId}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedFields),
    });
  } catch (networkErr) {
    // Network error — FastAPI server probably not running
    throw new Error(
      `Cannot reach the prediction server at ${API_BASE}. ` +
      `Make sure you ran: uvicorn main:app --reload --port 8000`
    );
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`API returned ${response.status}: ${detail}`);
  }

  return response.json();
}


// ================================================================
// MOCK: Document CNN (demo only — no real model file needed)
// ================================================================
function scoreToVerdict(score: number): "SAFE" | "SUSPICIOUS" | "FRAUD" {
  if (score < 35) return "SAFE";
  if (score < 70) return "SUSPICIOUS";
  return "FRAUD";
}

function mockDocumentCnn(imageFile?: File): PredictionResult {
  const score = Math.round(20 + Math.random() * 75);
  const verdict = scoreToVerdict(score);

  return {
    riskScore: score,
    verdict,
    confidence: 0.70 + Math.random() * 0.28,
    reasoning:
      verdict === "FRAUD"
        ? `ELA analysis detected significant JPEG compression inconsistencies around the document serial number and photo regions. DCT coefficient histogram divergence score: ${(0.3 + Math.random() * 0.5).toFixed(3)} (threshold: 0.15). High probability of digital splicing.`
        : verdict === "SUSPICIOUS"
        ? `Minor texture inconsistencies detected in document security features. Noise residual analysis shows mild deviation. Manual review recommended.`
        : `Document passes all integrity checks. JPEG noise residuals, font rendering metrics, and geometry are consistent with authentic samples.`,
    topFactors: [
      { factor: "JPEG DCT Anomaly",          contribution: (Math.random() * 0.5).toFixed(3), direction: Math.random() > 0.5 ? "up" : "down" },
      { factor: "Font Rendering Integrity",   contribution: `${(88 + Math.random() * 12).toFixed(1)}%`, direction: Math.random() > 0.6 ? "down" : "up" },
      { factor: "ELA Heatmap Score",          contribution: (Math.random() * 0.4).toFixed(3), direction: Math.random() > 0.4 ? "up" : "down" },
      { factor: "Security Feature Geometry",  contribution: `${(90 + Math.random() * 10).toFixed(1)}%`, direction: Math.random() > 0.5 ? "down" : "up" },
    ],
    processingTime: Math.round(60 + Math.random() * 40),
    modelVersion: "docforge-mock-v1.0",
  };
}
