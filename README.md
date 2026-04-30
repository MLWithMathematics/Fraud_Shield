<div align="center">

<br/>

<img src="https://img.shields.io/badge/FraudShield_AI-Intelligence_Against_Financial_Crime-0052FF?style=for-the-badge&labelColor=0a0a0a" />

<br/><br/>

**A full-stack ML fraud detection platform — 3 real models, live predictions, SHAP explainability, and a combined risk engine.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Backend-FFD21E?style=flat-square)](https://huggingface.co)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=flat-square&logo=python)](https://python.org)

</div>

---

## 🌐 Live Demo

- **Frontend:** [fraud-shield-ai.vercel.app](https://vercel.com) (Deployed on Vercel)
- **Backend API:** [huggingface.co/spaces/your-username/fraud-shield-api](https://huggingface.co) (Deployed on Hugging Face Spaces)

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
| **Network Visualization** | Interactive force-directed graph showing transaction relationships and risk clusters |
| **Case Management** | Full system to track, audit, and resolve suspicious transactions |
| **Alerts Dashboard** | Real-time monitoring of triggered fraud alerts with severity levels |
| **Batch Scoring** | Upload CSV files for mass transaction analysis and fraud detection |
| **Rule Engine** | Configure custom business rules to complement ML model predictions |
| **Live Predictions** | Inputs POSTed to FastAPI → animated gauge + verdict + reasoning in browser |
| **SHAP Explainability** | Per-prediction top risk factors from SHAP TreeExplainer (Model 1) |
| **Reconstruction Error** | Per-feature anomaly contribution from Autoencoder (Model 2) |
| **Behavioural Signals** | Amount deviation, hour deviation, velocity, sequence anomaly (Model 3) |
| **Risk Score Gauge** | Animated SVG arc gauge 0–100 with SAFE / SUSPICIOUS / FRAUD verdict |
| **Deep-Dive Charts** | Precision-Recall curves and SHAP importance bar charts (Recharts) |
| **Model Gallery** | Filterable grid — click any card to open deep-dive panel inline |
| **Live Transaction Feed** | Animated real-time mock stream on the home page |
| **Config-Driven UI** | All pages auto-generated from `config/models.ts` |
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
├── frontend/                        ← Next.js 14 frontend (Vercel)
│   ├── app/
│   │   ├── page.tsx                 ← Home — pipeline flowchart + model cards
│   │   ├── network/page.tsx         ← Network Visualization Graph
│   │   ├── alerts/page.tsx          ← Alerts Dashboard
│   │   ├── cases/page.tsx           ← Case Management System
│   │   ├── batch/page.tsx           ← Batch CSV Scoring
│   │   ├── rules/page.tsx           ← Rule Configuration
│   │   ├── gallery/page.tsx         ← Gallery — filter + deep-dive charts
│   │   ├── combined/page.tsx        ← Combined Risk Engine (all 3 models)
│   │   ├── how-to-use/page.tsx      ← In-app guide with sample inputs
│   │   ├── test/[modelId]/page.tsx  ← Dynamic testing lab (config-driven)
│   │   └── performance/page.tsx     ← Model metrics & monitoring
│   ├── components/
│   │   ├── Navbar.tsx               ← Home · Gallery · Risk Engine · How To Use
│   │   ├── LivePulse.tsx            ← Animated live transaction stream
│   │   ├── StatsBar.tsx             ← Animated counter stats (3-model AUC etc.)
│   │   ├── ModelCard.tsx            ← Config-driven gallery card
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
└── backend/                         ← Python FastAPI backend (Hugging Face)
    ├── main.py                      ← All 4 endpoints (3 models + combined)
    ├── requirements.txt
    ├── test_api.py                  ← Sanity check script
    └── models/                      ← Model artifacts (.pkl / .keras)
        ├── fraud_model_artifacts.pkl
        ├── anomaly_artifacts.pkl
        ├── autoencoder_model.keras
        ├── ato_artifacts.pkl
        └── ato_lstm_model.keras
```

---

## 🚀 Deployment

### Backend (Hugging Face Spaces)
The backend is deployed as a **Docker Space** on Hugging Face.
- **Hardware:** CPU Basic (Free tier)
- **Framework:** FastAPI
- **Exposed Port:** 7860 (Mapped to 8000 internally)

### Frontend (Vercel)
The frontend is a Next.js 14 App Router project deployed on Vercel.
- **Environment Variables:** `NEXT_PUBLIC_API_URL` points to the Hugging Face Space URL.

---

## 🛠️ Local Setup

You need **two terminals** running at the same time.

### Step 1 — Clone

```bash
git clone https://github.com/your-username/fraudshield-ai.git
cd fraudshield-ai
```

### Step 2 — Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Step 3 — Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Open **http://localhost:3000**

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `GET /` | GET | Health check — confirms which models loaded |
| `POST /predict/transaction-classifier` | POST | Model 1: XGB+LGB transaction scoring |
| `POST /predict/anomaly-detector` | POST | Model 2: Hybrid IsoForest+Autoencoder |
| `POST /predict/ato-detector` | POST | Model 3: GBM+LSTM behavioural ATO scoring |
| `POST /predict/combined` | POST | All 3 models → weighted combined verdict |

---

## 🔧 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Framer Motion** (Animations & Gauges)
- **Recharts** (SHAP & Precision-Recall)
- **Lucide React** (Icons)
- **D3.js / Canvas** (Network Visualization)

### Backend
- **FastAPI** (Python)
- **XGBoost & LightGBM**
- **SHAP** (Explainability)
- **Scikit-learn**
- **TensorFlow/Keras** (LSTM & Autoencoder)
- **Hugging Face Spaces** (Hosting)

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

**[Home](https://vercel.com) · [Model Gallery](https://vercel.com/gallery) · [Risk Engine](https://vercel.com/combined) · [How To Use](https://vercel.com/how-to-use)**

<br/>

⭐ If this project helped you, consider starring the repo

</div>
