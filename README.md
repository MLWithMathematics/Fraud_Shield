<div align="center">

# 🛡️ FraudShield AI

### Intelligence Against Financial Crime

**Two production-grade ML models for fraud detection — live, testable, and fully explainable.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)

</div>

---

## 📌 Overview

FraudShield AI is a full-stack machine learning showcase built around two real fraud detection models trained on Kaggle datasets. Enter transaction data directly in the browser and get live predictions with risk scores, reasoning, and top contributing factors returned from a FastAPI backend.

The platform is **config-driven** — adding a new model requires editing a single file (`config/models.ts`) and deploying a new FastAPI endpoint. The entire UI updates automatically.

---

## ✨ Features

| Feature | Detail |
|---|---|
| **2 Real ML Models** | Supervised XGBoost+LightGBM and Unsupervised IsolationForest+Autoencoder |
| **Live Predictions** | Inputs sent to FastAPI backend; live results rendered with animated gauge |
| **SHAP Explainability** | Per-prediction top risk factors from SHAP TreeExplainer (Model 1) |
| **Reconstruction Error** | Per-feature anomaly contribution from Autoencoder (Model 2) |
| **Risk Score Gauge** | Animated SVG gauge (0–100) with SAFE / SUSPICIOUS / FRAUD verdict |
| **Model Gallery** | Filterable grid with Precision-Recall and SHAP charts (Recharts) |
| **Live Transaction Feed** | Animated real-time transaction stream on the home page |
| **Config-Driven UI** | All pages generated from `config/models.ts` — zero UI changes to add a model |
| **Responsive Design** | Mobile and desktop layouts throughout |
| **Cyber-Financial Theme** | Dark mode with glassmorphism, grid overlays, and glow effects |

---

## 🤖 The Models

### Model 1 — TransactionGuard XGB+LGB
> **Supervised · Transaction Fraud Classification**

- **Dataset:** IEEE-CIS Fraud Detection (Kaggle) — ~590,000 real Vesta Corp transactions
- **Algorithm:** XGBoost + LightGBM ensemble (simple average of both probabilities)
- **Training:** Time-aware split (no shuffle) to prevent temporal leakage; `scale_pos_weight` for class imbalance (3.5% fraud rate)
- **Features:** 31 PCA velocity features (V1–V28) + engineered time, amount, card, and email features
- **Explainability:** SHAP `TreeExplainer` — returns top contributing features per prediction
- **Threshold:** Tuned to maximise F1 on imbalanced validation set
- **Artifacts saved:** `fraud_model_artifacts.pkl` (XGB, LGB, SHAP explainer, label encoders, threshold, feature list)

### Model 2 — AnomalyNet Hybrid
> **Unsupervised · Anomaly Detection**

- **Dataset:** ULB Credit Card Fraud Detection (Kaggle) — 284,807 European cardholder transactions
- **Algorithm:** Isolation Forest + Keras Autoencoder hybrid
- **Training:** Autoencoder trained **only on normal transactions** — learns to reconstruct them; high reconstruction error = anomaly
- **Hybrid Score:** `w_iso × ISO_score + w_ae × AE_recon_error` (weights from each model's AUC)
- **Features:** V1–V28 + `log_amount` + `hour` + `is_night` (31 features, RobustScaler)
- **Autoencoder Architecture:** `Input(31) → Dense(16) → Dense(8) → Bottleneck(4) → Dense(8) → Dense(16) → Output(31)`
- **Artifacts saved:** `anomaly_artifacts.pkl` + `autoencoder_model.keras`

---

## 🏗️ Project Structure

```
.
├── fraud-detection-showcase/        # Next.js 14 frontend
│   ├── app/
│   │   ├── page.tsx                 # Home page
│   │   ├── gallery/page.tsx         # Model gallery with filter + deep-dive
│   │   ├── test/[modelId]/page.tsx  # Dynamic testing lab (config-driven)
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── LivePulse.tsx            # Animated transaction stream
│   │   ├── StatsBar.tsx             # Animated counter stats
│   │   ├── ModelCard.tsx            # Gallery card (config-driven)
│   │   ├── ModelDeepDive.tsx        # Recharts — SHAP bar / Precision-Recall
│   │   ├── NumericForm.tsx          # Structured input form + CSV upload
│   │   ├── RiskGauge.tsx            # SVG animated arc gauge
│   │   ├── ScanningOverlay.tsx      # 2-second "deep scanning" animation
│   │   └── SecurityReport.tsx       # Prediction result card
│   ├── config/
│   │   └── models.ts               ⭐ Single source of truth — edit this to add models
│   └── lib/
│       └── mockPredict.ts          # API routing layer (swap mock → real fetch here)
│
└── fraud-api/                       # Python FastAPI backend
    ├── main.py                      # Both prediction endpoints
    ├── requirements.txt
    ├── test_api.py                  # Sanity check before using the browser
    └── models/                      # Paste your .pkl files here
        ├── fraud_model_artifacts.pkl
        ├── anomaly_artifacts.pkl
        └── autoencoder_model.keras
```

---

## 🚀 Local Setup

You need **two terminals** running simultaneously — one for the Python backend, one for the Next.js frontend.

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.10+ | [python.org](https://python.org) |
| Git | any | [git-scm.com](https://git-scm.com) |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/fraudshield-ai.git
cd fraudshield-ai
```

---

### Step 2 — Save model artifacts from Jupyter notebooks

Run the full training notebooks first (or use pre-trained artifacts). Then add these cells **at the bottom** of each notebook and run them.

**Bottom of `fraud_detection_model1.ipynb`:**
```python
import pickle, os
os.makedirs("models", exist_ok=True)

artifacts = {
    "xgb_model":      xgb_model,
    "lgb_model":      lgb_model,
    "explainer":      explainer,
    "label_encoders": label_encoders,
    "threshold":      float(THRESHOLD),
    "feature_names":  X_train.columns.tolist(),
    "dropped_cols":   cols_to_drop,
}
with open("models/fraud_model_artifacts.pkl", "wb") as f:
    pickle.dump(artifacts, f)
print("✅ Saved Model 1 artifacts")
```

**Bottom of `fraud_detection_model2.ipynb`:**
```python
import pickle, os
os.makedirs("models", exist_ok=True)

autoencoder.save("models/autoencoder_model.keras")

artifacts = {
    "iso_forest":    iso_forest,    "scaler":        scaler,
    "feature_cols":  FEATURE_COLS,  "iso_min":       float(ISO_MIN),
    "iso_max":       float(ISO_MAX), "ae_min":        float(AE_MIN),
    "ae_max":        float(AE_MAX),  "w_iso":         float(w_iso),
    "w_ae":          float(w_ae),    "hybrid_thresh": float(hybrid_thresh),
    "iso_thresh":    float(iso_thresh), "ae_thresh":  float(ae_thresh),
}
with open("models/anomaly_artifacts.pkl", "wb") as f:
    pickle.dump(artifacts, f)
print("✅ Saved Model 2 artifacts")
```

Move the generated files into `fraud-api/models/`:
```
fraud-api/models/
├── fraud_model_artifacts.pkl
├── anomaly_artifacts.pkl
└── autoencoder_model.keras
```

---

### Step 3 — Backend setup (Terminal 1)

```bash
cd fraud-api

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

You should see:
```
✅ XGBoost loaded  | threshold=0.35
✅ LightGBM loaded | features=142
✅ IsolationForest loaded | hybrid_thresh=0.6134
✅ Autoencoder loaded
🚀 Server ready.
INFO: Uvicorn running on http://127.0.0.1:8000
```

**Verify the API works before opening the browser:**
```bash
python test_api.py
```

This runs 4 test predictions and prints results. All should pass.

---

### Step 4 — Frontend setup (Terminal 2)

```bash
cd fraud-detection-showcase

# Install dependencies
npm install

# Create the environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### Step 5 — Test a prediction

1. Go to **[http://localhost:3000/gallery](http://localhost:3000/gallery)**
2. Click **"Test Model"** on either card
3. Fill in the input fields
4. Click **"Run Analysis"**
5. Watch the scanning animation, then see the Security Report with risk gauge, verdict, and top factors

---

## 🧪 Sample Input Values

Use these to verify predictions look reasonable.

### Model 1 — TransactionGuard (Low Risk)
| Field | Value |
|---|---|
| Transaction Amount | `29.99` |
| V1 | `0.5` |
| V3 | `0.2` |
| Card Network | `visa` |
| Product Code | `W` |
| Hour | `14` |

### Model 1 — TransactionGuard (High Risk)
| Field | Value |
|---|---|
| Transaction Amount | `8500.00` |
| V1 | `-4.2` |
| V3 | `-3.1` |
| Card Network | `discover` |
| Product Code | `C` |
| Hour | `3` |

### Model 2 — AnomalyNet (Normal)
| Field | Value |
|---|---|
| Amount | `45.00` |
| V1 | `0.1` |
| V2 | `0.3` |
| V4 | `0.2` |
| V14 | `-0.1` |
| Hour | `10` |

### Model 2 — AnomalyNet (Anomalous)
| Field | Value |
|---|---|
| Amount | `12500.00` |
| V1 | `-6.2` |
| V2 | `4.8` |
| V4 | `-5.1` |
| V14 | `-12.3` |
| Hour | `2` |

---

## ➕ Adding a New Model

The platform is config-driven. You only need to touch **2 files**:

### 1. `config/models.ts` — Add a new entry to the `models[]` array

```typescript
{
  id: "my-new-model",          // ← becomes the URL: /test/my-new-model
  name: "My New Model",
  type: "numeric",             // "numeric" = form inputs | "image" = drag & drop
  tagline: "Short one-liner.",
  description: "Full description shown on the test page.",
  techStack: ["LightGBM", "FastAPI"],
  category: "Wire Transfer Fraud",
  architecture: "Model architecture notes.",
  inputFields: [
    { name: "amount", label: "Amount ($)", placeholder: "e.g. 500", type: "number" },
  ],
  stats: [{ label: "AUC", value: "98%", highlight: true }],
  chartType: "precision-recall",
  chartData: [
    { recall: 0.0, precision: 1.0 },
    { recall: 0.5, precision: 0.92 },
    { recall: 1.0, precision: 0.25 },
  ],
  color: "blue",
}
```

### 2. `fraud-api/main.py` — Add a new FastAPI endpoint

```python
class MyModelInput(BaseModel):
    amount: float

@app.post("/predict/my-new-model")   # ← id must match models.ts
def predict_my_model(data: MyModelInput):
    # load your pkl, run prediction, return PredictionResult shape
    return {
        "riskScore": 42,
        "verdict": "SUSPICIOUS",
        "confidence": 0.42,
        "reasoning": "...",
        "topFactors": [],
        "processingTime": 10,
        "modelVersion": "v1.0",
    }
```

The gallery card, test page form, navigation, and deep-dive chart all appear automatically.

---

## 🔧 Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework with file-based routing |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion | Page animations, loading states, gauge |
| Recharts | Precision-Recall and SHAP charts |
| Lucide React | Icons |
| react-dropzone | Image model file upload |

### Backend
| Library | Purpose |
|---|---|
| FastAPI | REST API with automatic OpenAPI docs |
| Uvicorn | ASGI server |
| scikit-learn | IsolationForest, RobustScaler, LabelEncoder |
| XGBoost | Gradient boosted trees |
| LightGBM | Gradient boosted trees |
| SHAP | TreeExplainer for local feature attribution |
| TensorFlow/Keras | Autoencoder model |
| Pydantic | Input validation |

---

## 📡 API Reference

Base URL: `http://localhost:8000`

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Health check — shows which models are loaded |
| `/predict/transaction-classifier` | POST | XGB+LGB ensemble prediction |
| `/predict/anomaly-detector` | POST | Hybrid IsoForest+Autoencoder prediction |
| `/docs` | GET | Auto-generated Swagger UI (FastAPI) |

### Response shape (all endpoints)
```json
{
  "riskScore":      72,
  "verdict":        "FRAUD",
  "confidence":     0.7183,
  "reasoning":      "Explanation string...",
  "topFactors": [
    { "factor": "TransactionAmt", "contribution": "8500.0", "direction": "up" }
  ],
  "processingTime": 14,
  "modelVersion":   "xgb-lgb-ensemble-v1.0"
}
```

---

## 🗂️ Datasets

| Model | Dataset | Source | Size |
|---|---|---|---|
| TransactionGuard | IEEE-CIS Fraud Detection | [Kaggle](https://www.kaggle.com/c/ieee-fraud-detection) | ~590K transactions |
| AnomalyNet | Credit Card Fraud Detection | [Kaggle](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud) | 284,807 transactions |

Both datasets are **not included** in this repository. Download them via the Kaggle CLI:

```bash
# IEEE-CIS (requires competition acceptance)
kaggle competitions download -c ieee-fraud-detection

# ULB Credit Card
kaggle datasets download -d mlg-ulb/creditcardfraud
```

---

## 🔮 Potential Improvements

- **Live SHAP waterfall charts** — return per-feature SHAP arrays from FastAPI and render them as interactive waterfall charts
- **Batch CSV scoring** — the CSV upload button is wired up; connect it to a `/predict/batch` endpoint that returns a downloadable results file
- **Real-time WebSocket feed** — replace the mock live transaction stream with a WebSocket connection to a live scoring pipeline
- **Model comparison mode** — submit the same transaction to both models side-by-side and compare results
- **Feedback loop** — thumbs up/down on each report to collect labelled corrections for retraining

---

## 👤 Author

**Shubhankar**  
Full-Stack Developer & ML Engineer  
Built with Next.js 14, FastAPI, XGBoost, LightGBM, and Keras.

---

<div align="center">
  <p>If this project helped you, consider giving it a ⭐</p>
</div>
