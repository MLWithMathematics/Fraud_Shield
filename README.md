<div align="center">

<br/>

<img src="https://img.shields.io/badge/FraudShield_AI-Intelligence_Against_Financial_Crime-0052FF?style=for-the-badge&labelColor=0a0a0a" />

<br/><br/>

**A full-stack ML fraud detection platform — 3 real models, live predictions, SHAP explainability, and a combined risk engine.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=flat-square&logo=python)](https://python.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-orange?style=flat-square)](https://xgboost.readthedocs.io)
[![TensorFlow](https://img.shields.io/badge/TensorFlow_2-FF6F00?style=flat-square&logo=tensorflow)](https://tensorflow.org)

</div>

---

## 📌 What Is This?

FraudShield AI is a production-grade ML showcase with three real fraud detection models trained on Kaggle datasets. You enter transaction data in the browser, the Next.js frontend sends it to a FastAPI Python server, the server loads your `.pkl` artifacts and returns a live prediction with risk score, reasoning, and top contributing factors.

The platform is **config-driven** — the entire UI (gallery cards, test forms, navigation, deep-dive charts) is generated from a single file: `config/models.ts`. Adding a new model means editing that one file and adding one endpoint to `main.py`.

---

## 🔬 The 3-Model Pipeline

```
Incoming Transaction
        │
        ├──► Model 1  XGBoost + LightGBM ──────► Transaction Risk Score   (40% weight)
        │    Asks: "Is THIS TRANSACTION fraudulent?"
        │
        ├──► Model 2  IsolationForest + Autoencoder ──► Anomaly Flag       (30% weight)
        │    Asks: "Does this transaction look STATISTICALLY UNUSUAL?"
        │
        └──► Model 3  GBM + LSTM ──────────────────► Behavioural Score    (30% weight)
             Asks: "Is this USER behaving like THEMSELVES?"
                              │
                    Combined Risk Engine
                    weighted average of all three
                              │
                    LOW / MEDIUM / HIGH / CRITICAL
```

Each model covers blind spots the other two cannot see:
- **Model 1** catches known fraud patterns with high precision (supervised, labelled data)
- **Model 2** catches statistical anomalies — including fraud types never seen before (unsupervised)
- **Model 3** catches account takeover — where the transaction looks normal but the user behaviour does not (sequence model)

---

## ✨ Platform Features

| Feature | Detail |
|---|---|
| **3 Real ML Models** | XGB+LGB, IsoForest+Autoencoder, GBM+LSTM — all trained on real Kaggle data |
| **Combined Risk Engine** | One endpoint runs all 3 models → weighted verdict: LOW/MEDIUM/HIGH/CRITICAL |
| **Live Predictions** | Inputs POSTed to FastAPI → animated gauge + verdict + reasoning in browser |
| **SHAP Explainability** | Per-prediction top risk factors from SHAP TreeExplainer (Model 1) |
| **Reconstruction Error** | Per-feature anomaly contribution from Autoencoder (Model 2) |
| **Behavioural Signals** | Amount deviation, hour deviation, velocity, sequence anomaly (Model 3) |
| **Risk Score Gauge** | Animated SVG arc gauge 0–100 with SAFE / SUSPICIOUS / FRAUD verdict |
| **Deep-Dive Charts** | Precision-Recall curves and SHAP importance bar charts (Recharts) |
| **Model Gallery** | Filterable grid — click any card to open deep-dive panel inline |
| **Live Transaction Feed** | Animated real-time mock stream on the home page |
| **Config-Driven UI** | All pages auto-generated from `config/models.ts` |
| **How To Use Guide** | Built-in in-app guide page with sample inputs for every model |
| **Responsive** | Fully responsive — mobile, tablet, and desktop |

---

## 🤖 The Models

### Model 1 — TransactionGuard XGB+LGB
> **Supervised · Transaction Fraud Classification**

| | |
|---|---|
| **Dataset** | IEEE-CIS Fraud Detection (Kaggle) — ~590,000 real Vesta Corp transactions |
| **Algorithms** | XGBoost + LightGBM (simple ensemble average) |
| **Training split** | Time-aware (no shuffle) — prevents temporal leakage |
| **Class imbalance** | `scale_pos_weight` on XGB; `is_unbalance=True` on LGB |
| **Features** | PCA velocity features V1–V28 + engineered: log_amount, hour, day_of_week, is_night, card velocity stats, email domain fraud rate |
| **Explainability** | SHAP `TreeExplainer` — real top-N features per prediction |
| **Threshold** | Tuned to maximise F1 on imbalanced validation set |
| **Saved artifacts** | `fraud_model_artifacts.pkl` (XGB, LGB, SHAP explainer, label encoders, threshold, feature list) |

**Best for:** Catching known patterns — card-not-present fraud, velocity abuse, unusual amounts relative to global patterns.

---

### Model 2 — AnomalyNet Hybrid
> **Unsupervised · Anomaly Detection**

| | |
|---|---|
| **Dataset** | ULB Credit Card Fraud (Kaggle) — 284,807 European cardholder transactions |
| **Algorithms** | Isolation Forest (200 trees) + Keras Autoencoder (bottleneck=4) |
| **Key insight** | Autoencoder trained **only on normal transactions** — fraud has high reconstruction error |
| **Hybrid score** | `w_iso × IF_score + w_ae × recon_error` — weights derived from each model's AUC |
| **Features** | V1–V28 + log_amount + hour + is_night (31 features, RobustScaler) |
| **Autoencoder arch** | Input(31)→Dense(16)→Dense(8)→Bottleneck(4)→Dense(8)→Dense(16)→Output(31) |
| **Saved artifacts** | `anomaly_artifacts.pkl` + `autoencoder_model.keras` |

**Best for:** Zero-day fraud — attack patterns no supervised model has ever seen, because no fraud label was required to train this model.

---

### Model 3 — BehaviourGuard GBM+LSTM
> **Behavioural Sequence Model · Account Takeover Detection**

| | |
|---|---|
| **Dataset** | IEEE-CIS (same as Model 1) — behavioural sequences engineered per card |
| **Algorithms** | GradientBoostingClassifier (300 trees) + Keras LSTM (seq_len=5) |
| **ATO label** | Compromised card + transaction at or after first confirmed fraud event |
| **Behavioural features** | amt_deviation, amt_vs_max_pct, time_since_last, gap_deviation, hour_deviation, is_rapid_tx, tx_rank_pct, user baseline stats |
| **LSTM arch** | Input(5,7)→Masking→LSTM(64,return_seq)→Dropout(0.2)→LSTM(32)→Dropout→Dense(16)→Sigmoid |
| **Ensemble** | `w_gbm × GBM_score + w_lstm × LSTM_score` (AUC-weighted) |
| **Saved artifacts** | `ato_artifacts.pkl` + `ato_lstm_model.keras` |

**Best for:** Account takeover — the attacker has the correct card details and makes transactions in normal amounts, but at the wrong hour, with unusual velocity, or in an out-of-character sequence.

---

## 🏗️ Project Structure

```
.
├── fraud-detection-showcase/        ← Next.js 14 frontend
│   ├── app/
│   │   ├── page.tsx                 ← Home — pipeline flowchart + model cards
│   │   ├── gallery/page.tsx         ← Gallery — filter + deep-dive charts
│   │   ├── combined/page.tsx        ← Combined Risk Engine (all 3 models)
│   │   ├── how-to-use/page.tsx      ← In-app guide with sample inputs
│   │   ├── test/[modelId]/page.tsx  ← Dynamic testing lab (config-driven)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx               ← Home · Gallery · Risk Engine · How To Use
│   │   ├── LivePulse.tsx            ← Animated live transaction stream
│   │   ├── StatsBar.tsx             ← Animated counter stats (3-model AUC etc.)
│   │   ├── ModelCard.tsx            ← Config-driven gallery card (supports purple)
│   │   ├── ModelDeepDive.tsx        ← Recharts SHAP bar / Precision-Recall
│   │   ├── NumericForm.tsx          ← Form inputs + CSV upload button
│   │   ├── RiskGauge.tsx            ← SVG animated arc gauge
│   │   ├── ScanningOverlay.tsx      ← "Deep Scanning" loading animation
│   │   └── SecurityReport.tsx       ← Full prediction result card
│   ├── config/
│   │   └── models.ts               ⭐ Single source of truth — edit to add models
│   └── lib/
│       └── mockPredict.ts           ← API routing: predict() + predictCombined()
│
└── fraud-api/                       ← Python FastAPI backend
    ├── main.py                      ← All 4 endpoints (3 models + combined)
    ├── requirements.txt
    ├── test_api.py                  ← Sanity check script (run before browser)
    ├── save_artifacts.py            ← Helper: copy-paste into notebooks to save .pkl
    └── models/                      ← Paste your .pkl files here
        ├── fraud_model_artifacts.pkl
        ├── anomaly_artifacts.pkl
        ├── autoencoder_model.keras
        ├── ato_artifacts.pkl
        └── ato_lstm_model.keras
```

---

## 🚀 Local Setup

You need **two terminals** running at the same time.

### Prerequisites

| Tool | Version | Link |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.10+ | [python.org](https://python.org) |
| Git | any | [git-scm.com](https://git-scm.com) |

---

### Step 1 — Clone

```bash
git clone https://github.com/your-username/fraudshield-ai.git
cd fraudshield-ai
```

---

### Step 2 — Save model artifacts from your Jupyter notebooks

Run each notebook to completion, then add the following cells at the very bottom and execute them.

#### Model 1 — bottom of `fraud_detection_model1.ipynb`

```python
import pickle, os
os.makedirs("models", exist_ok=True)

artifacts = {
    "xgb_model":      xgb_model,
    "lgb_model":      lgb_model,
    "explainer":      explainer,          # shap.TreeExplainer(xgb_model)
    "label_encoders": label_encoders,
    "threshold":      float(THRESHOLD),
    "feature_names":  X_train.columns.tolist(),
    "dropped_cols":   cols_to_drop,
}
with open("models/fraud_model_artifacts.pkl", "wb") as f:
    pickle.dump(artifacts, f)
print("✅ Model 1 saved")
```

#### Model 2 — bottom of `fraud_detection_model2.ipynb`

```python
import pickle, os
os.makedirs("models", exist_ok=True)

autoencoder.save("models/autoencoder_model.keras")

artifacts = {
    "iso_forest": iso_forest, "scaler": scaler,
    "feature_cols": FEATURE_COLS,
    "iso_min": float(ISO_MIN), "iso_max": float(ISO_MAX),
    "ae_min":  float(AE_MIN),  "ae_max":  float(AE_MAX),
    "w_iso": float(w_iso), "w_ae": float(w_ae),
    "hybrid_thresh": float(hybrid_thresh),
    "iso_thresh": float(iso_thresh), "ae_thresh": float(ae_thresh),
}
with open("models/anomaly_artifacts.pkl", "wb") as f:
    pickle.dump(artifacts, f)
print("✅ Model 2 saved")
```

#### Model 3 — bottom of `fraud_detection_model3.ipynb`

```python
import pickle, os
os.makedirs("models", exist_ok=True)

lstm_model.save("models/ato_lstm_model.keras")

artifacts = {
    "gbm_model":       gbm,
    "scaler_behav":    scaler_behav,
    "scaler_seq":      scaler_seq,
    "behav_features":  BEHAV_FEATURES,
    "seq_features":    SEQ_FEATURES,
    "seq_len":         SEQ_LEN,
    "n_seq_feats":     n_seq_feats,
    "w_gbm":           w_gbm,
    "w_lstm":          w_lstm,
    "ato_threshold":   ATO_THRESHOLD,
    "gbm_auc":         gbm_auc,
    "lstm_auc":        lstm_auc,
    "ensemble_auc":    ensemble_auc,
}
with open("models/ato_artifacts.pkl", "wb") as f:
    pickle.dump(artifacts, f)
print("✅ Model 3 saved")
```

Copy all generated files into `fraud-api/models/`:

```
fraud-api/models/
├── fraud_model_artifacts.pkl     ← Model 1
├── anomaly_artifacts.pkl         ← Model 2
├── autoencoder_model.keras       ← Model 2 (Keras)
├── ato_artifacts.pkl             ← Model 3
└── ato_lstm_model.keras          ← Model 3 (Keras)
```

---

### Step 3 — Backend (Terminal 1)

```bash
cd fraud-api

# Create virtual environment
python -m venv venv

# Activate — Windows:
venv\Scripts\activate
# Activate — Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

Expected output on startup:
```
✅ XGBoost loaded  | threshold=0.35
✅ LightGBM loaded | features=142
✅ IsolationForest loaded | hybrid_thresh=0.613
✅ Autoencoder loaded
✅ GBM loaded | ato_threshold=0.42
✅ LSTM loaded
🚀 Server ready.
INFO: Uvicorn running on http://127.0.0.1:8000
```

Run sanity checks before opening the browser:
```bash
python test_api.py
```

---

### Step 4 — Frontend (Terminal 2)

```bash
cd fraud-detection-showcase

npm install

# Create env file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

Open **http://localhost:3000**

---

## 🧪 Sample Test Inputs

### Model 1 — TransactionGuard

| Scenario | Amount | V1 | V3 | Card | Product | Hour |
|---|---|---|---|---|---|---|
| ✅ Low risk | `29.99` | `0.5` | `0.2` | `visa` | `W` | `14` |
| 🔴 High risk | `8500.00` | `-4.2` | `-3.1` | `discover` | `C` | `3` |

### Model 2 — AnomalyNet

| Scenario | Amount | V1 | V2 | V4 | V14 | Hour |
|---|---|---|---|---|---|---|
| ✅ Normal | `45.00` | `0.1` | `0.3` | `0.2` | `-0.1` | `10` |
| 🔴 Anomalous | `12500.00` | `-6.2` | `4.8` | `-5.1` | `-12.3` | `2` |

### Model 3 — BehaviourGuard

| Scenario | Amount | User Avg | Min Since Last | Hour | User Avg Hour | Txn Count |
|---|---|---|---|---|---|---|
| ✅ Normal user | `95.00` | `100.00` | `480` | `14` | `13` | `45` |
| 🔴 Account takeover | `4200.00` | `85.00` | `3` | `2` | `13` | `12` |

### Combined Risk Engine

Use the anomalous values from all three models together on the `/combined` page to see a CRITICAL verdict with all three models firing simultaneously.

---

## 📡 API Reference

Base URL: `http://localhost:8000`

| Endpoint | Method | Description |
|---|---|---|
| `GET /` | GET | Health check — confirms which models loaded |
| `POST /predict/transaction-classifier` | POST | Model 1: XGB+LGB transaction scoring |
| `POST /predict/anomaly-detector` | POST | Model 2: Hybrid IsoForest+Autoencoder |
| `POST /predict/ato-detector` | POST | Model 3: GBM+LSTM behavioural ATO scoring |
| `POST /predict/combined` | POST | All 3 models → weighted combined verdict |
| `GET /docs` | GET | Auto-generated Swagger UI |

### Standard response shape (single model)

```json
{
  "riskScore":      85,
  "verdict":        "FRAUD",
  "confidence":     0.8512,
  "reasoning":      "Human-readable explanation...",
  "topFactors": [
    { "factor": "TransactionAmt", "contribution": "8500.0", "direction": "up" },
    { "factor": "Hour of Day",    "contribution": "3:00",   "direction": "up" }
  ],
  "processingTime": 14,
  "modelVersion":   "xgb-lgb-ensemble-v1.0"
}
```

### Combined engine response shape

```json
{
  "combinedScore": 78,
  "riskLevel":     "HIGH",
  "verdict":       "FRAUD",
  "weights":       { "model1": 0.40, "model2": 0.30, "model3": 0.30 },
  "model1":        { ...PredictionResult },
  "model2":        { ...PredictionResult },
  "model3":        { ...PredictionResult },
  "processingTime": 42
}
```

---

## 🗂️ Datasets

| Model | Dataset | Source | Rows |
|---|---|---|---|
| TransactionGuard | IEEE-CIS Fraud Detection | [Kaggle Competition](https://www.kaggle.com/c/ieee-fraud-detection) | ~590K |
| AnomalyNet | ULB Credit Card Fraud | [Kaggle Dataset](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud) | 284,807 |
| BehaviourGuard | IEEE-CIS (behavioural sequences) | Same as Model 1 | ~590K |

Datasets are **not included** in this repo. Download via Kaggle CLI:

```bash
pip install kaggle

# Model 1 & 3 (requires accepting competition rules on Kaggle website first)
kaggle competitions download -c ieee-fraud-detection
unzip ieee-fraud-detection.zip

# Model 2
kaggle datasets download -d mlg-ulb/creditcardfraud
unzip creditcardfraud.zip
```

---

## ➕ Adding a New Model

Only **2 files** to touch — the entire UI updates automatically.

### 1. `config/models.ts`

```typescript
{
  id:           "my-model",        // → URL: /test/my-model, API: /predict/my-model
  name:         "My Model",
  shortName:    "Short",
  type:         "numeric",         // "numeric" = form | "image" = drag & drop
  tagline:      "One-liner.",
  description:  "Full description.",
  techStack:    ["LightGBM", "FastAPI"],
  category:     "Wire Transfer Fraud",
  pipelineRole: "Checks X",
  architecture: "Architecture notes.",
  inputFields: [
    { name: "amount", label: "Amount ($)", placeholder: "e.g. 500", type: "number" },
  ],
  stats: [{ label: "AUC", value: "98%", highlight: true }],
  chartType: "precision-recall",
  chartData: [
    { recall: 0.0, precision: 1.0 },
    { recall: 1.0, precision: 0.25 },
  ],
  color: "blue",  // "blue" | "green" | "red" | "purple"
}
```

### 2. `fraud-api/main.py`

```python
class MyModelInput(BaseModel):
    amount: float

@app.post("/predict/my-model")   # id must match models.ts
def predict_my_model(data: MyModelInput):
    # load pkl, run inference
    return {
        "riskScore": 42, "verdict": "SUSPICIOUS",
        "confidence": 0.42, "reasoning": "...",
        "topFactors": [], "processingTime": 12,
        "modelVersion": "v1.0",
    }
```

Gallery card, test page, and deep-dive chart appear instantly.

---

## 🔧 Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| Next.js | 14.2 | React framework, App Router, file-based routing |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 11 | Animations, page transitions, gauge, scanning overlay |
| Recharts | 2.12 | Precision-Recall curves and SHAP bar charts |
| Lucide React | 0.408 | Icon set |
| react-dropzone | 14 | Image model file upload |

### Backend
| Package | Purpose |
|---|---|
| FastAPI 0.111 | REST API framework with auto Swagger docs |
| Uvicorn | ASGI server |
| XGBoost 2 | Gradient boosted trees (Model 1) |
| LightGBM 4 | Gradient boosted trees (Model 1) |
| SHAP 0.45 | Local feature attribution (Model 1) |
| scikit-learn 1.5 | IsolationForest, GBM, scalers (Models 2 & 3) |
| TensorFlow 2.16 | Keras Autoencoder (Model 2) + LSTM (Model 3) |
| Pydantic 2 | Input validation and schema enforcement |

---

## 🔮 Future Improvements

- **Live SHAP waterfall** — return per-feature SHAP arrays from FastAPI; render interactive waterfall charts per prediction
- **Batch CSV scoring** — the CSV upload button is already wired; connect to a `/predict/batch` endpoint
- **Real-time WebSocket feed** — replace the mock live feed with an actual WebSocket scoring pipeline
- **Adjustable engine weights** — let the user drag sliders to reweight model contributions in the Combined Engine
- **Feedback loop** — thumbs up/down on each report stored in Postgres; weekly active-learning retraining
- **LSTM attention heatmap** — visualise which of the 5 sequence steps the LSTM focused on most

---

## 👤 Author

**Shubhankar**  
Full-Stack Developer & ML Engineer  
Built with Next.js 14, FastAPI, XGBoost, LightGBM, Keras, and a lot of SHAP values.

---

<div align="center">

**[Home](http://localhost:3000) · [Model Gallery](http://localhost:3000/gallery) · [Risk Engine](http://localhost:3000/combined) · [How To Use](http://localhost:3000/how-to-use)**

<br/>

⭐ If this project helped you, consider starring the repo

</div>
