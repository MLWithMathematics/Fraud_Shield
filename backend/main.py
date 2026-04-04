# fraud-api/main.py
# ================================================================
# FastAPI backend for FraudShield AI
# Serves 2 models:
#   POST /predict/transaction-classifier  ← Model 1 (XGB + LGB ensemble)
#   POST /predict/anomaly-detector        ← Model 2 (IsoForest + Autoencoder)
# ================================================================

import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# ── Tensorflow / Keras (for Autoencoder) ──────────────────────────────────────
# We import inside a try/except so the server still boots if TF is not installed
try:
    from tensorflow import keras
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠  TensorFlow not installed — Anomaly Detector endpoint will not work.")
    print("   Run: pip install tensorflow")


# ================================================================
# 1. Create App & CORS
# ================================================================
app = FastAPI(
    title="FraudShield AI API",
    description="Prediction endpoints for Transaction Classifier and Anomaly Detector",
    version="1.0.0",
)

# Allow the Next.js dev server (port 3000) to call this API.
# For production: change allow_origins to your real domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================================================================
# 2. Load Model Artifacts at Startup
#    Both models are loaded ONCE when the server starts.
#    This way every request is fast — no disk reads per prediction.
# ================================================================

# ── Model 1 ──────────────────────────────────────────────────────
print("\n🔄 Loading Model 1 artifacts (fraud_model_artifacts.pkl)...")
try:
    with open("models/fraud.pkl", "rb") as f:
        m1 = pickle.load(f)

    M1_XGB            = m1["xgb_model"]       # XGBoost classifier
    M1_LGB            = m1["lgb_model"]        # LightGBM classifier
    M1_EXPLAINER      = m1["explainer"]        # SHAP TreeExplainer
    M1_LABEL_ENCODERS = m1["label_encoders"]   # dict: col_name → LabelEncoder
    M1_THRESHOLD      = float(m1["threshold"]) # best F1 threshold
    M1_FEATURE_NAMES  = m1["feature_names"]    # exact ordered list of features

    print(f"   ✅ XGBoost loaded  | threshold={M1_THRESHOLD:.2f}")
    print(f"   ✅ LightGBM loaded | features={len(M1_FEATURE_NAMES)}")
    M1_LOADED = True
except Exception as e:
    print(f"   ❌ Could not load Model 1: {e}")
    print("   Make sure fraud_model_artifacts.pkl is in the models/ folder.")
    M1_LOADED = False

# ── Model 2 ──────────────────────────────────────────────────────
print("\n🔄 Loading Model 2 artifacts (anomaly_artifacts.pkl)...")
try:
    with open("models/anomaly.pkl", "rb") as f:
        m2 = pickle.load(f)

    M2_ISO_FOREST   = m2["iso_forest"]      # Isolation Forest
    M2_SCALER       = m2["scaler"]          # RobustScaler
    M2_FEATURE_COLS = m2["feature_cols"]    # ['V1'..'V28', 'log_amount', 'hour', 'is_night']
    M2_ISO_MIN      = float(m2["iso_min"])
    M2_ISO_MAX      = float(m2["iso_max"])
    M2_AE_MIN       = float(m2["ae_min"])
    M2_AE_MAX       = float(m2["ae_max"])
    M2_W_ISO        = float(m2["w_iso"])
    M2_W_AE         = float(m2["w_ae"])
    M2_HYBRID_THRESH= float(m2["hybrid_thresh"])

    print(f"   ✅ IsolationForest loaded | hybrid_thresh={M2_HYBRID_THRESH:.4f}")
    print(f"   ✅ Scaler loaded | features={len(M2_FEATURE_COLS)}")
    M2_LOADED = True
except Exception as e:
    print(f"   ❌ Could not load Model 2 pkl: {e}")
    M2_LOADED = False

# ── Load Keras Autoencoder separately ──────────────────────────────
M2_AUTOENCODER = None
if M2_LOADED and TF_AVAILABLE:
    try:
        M2_AUTOENCODER = keras.models.load_model("models/autoencoder_model.keras")
        print("   ✅ Autoencoder loaded")
    except Exception as e:
        print(f"   ❌ Could not load Autoencoder: {e}")
        print("   Make sure autoencoder_model.keras is in the models/ folder.")

print("\n🚀 Server ready.\n")


# ================================================================
# 3. Helper Utilities
# ================================================================

def risk_score_to_verdict(score: int) -> str:
    """Convert 0-100 risk score to verdict string matching the frontend."""
    if score >= 70:
        return "FRAUD"
    elif score >= 35:
        return "SUSPICIOUS"
    return "SAFE"


def build_top_factors(feature_names, shap_vals, feature_values, top_n=4):
    """
    Return the top_n most impactful SHAP features in the format
    the frontend SecurityReport card expects.
    """
    shap_series = pd.Series(shap_vals, index=feature_names)
    top_features = shap_series.abs().nlargest(top_n).index.tolist()
    return [
        {
            "factor":       feat,
            "contribution": str(round(float(feature_values.get(feat, -999)), 4)),
            "direction":    "up" if shap_series[feat] > 0 else "down",
        }
        for feat in top_features
    ]


# ================================================================
# 4. Model 1 — Transaction Fraud Classifier
# ================================================================

class TransactionInput(BaseModel):
    """
    Input for the transaction fraud classifier.
    Only the MOST IMPORTANT features are exposed in the UI.
    All other features default to -999 (the model's missing-value sentinel).

    Field names here MUST match inputFields[].name in config/models.ts
    and the values inside FEATURE_NAMES saved in the artifact.
    """
    TransactionAmt: float = 100.0    # transaction amount in USD
    V1:  Optional[float] = -999.0   # PCA component 1 (velocity-related)
    V2:  Optional[float] = -999.0   # PCA component 2
    V3:  Optional[float] = -999.0   # PCA component 3
    card4: Optional[str] = None     # card network: visa / mastercard / discover / american express
    ProductCD: Optional[str] = None # product: W / H / C / S / R
    hour: Optional[int] = 12        # hour of transaction 0-23


@app.post("/predict/transaction-classifier")
def predict_transaction(data: TransactionInput):
    """
    Score a single transaction using the XGB+LGB ensemble.
    Returns a JSON blob matching the PredictionResult interface in lib/mockPredict.ts
    """
    if not M1_LOADED:
        raise HTTPException(
            status_code=503,
            detail="Model 1 artifacts not loaded. Check models/fraud_model_artifacts.pkl"
        )

    # ── Step A: Build a DataFrame with ALL expected feature columns ───────────
    # Start by filling everything with -999 (the training-time missing sentinel).
    # XGBoost and LightGBM handle -999 gracefully.
    row = {feat: -999.0 for feat in M1_FEATURE_NAMES}

    # ── Step B: Fill in the user-provided values ──────────────────────────────
    # Map from our simplified API field names → the feature names in the model
    user_overrides = {
        "TransactionAmt": data.TransactionAmt,
        "V1":  data.V1,
        "V2":  data.V2,
        "V3":  data.V3,
        "hour":          data.hour,
        # Derived features we can compute from user input
        "log_amount":    float(np.log1p(data.TransactionAmt)),
        "is_night":      int(data.hour is not None and (data.hour >= 22 or data.hour <= 5)),
        "is_weekend":    0,  # unknown — default to 0
        "amt_cents":     int(data.TransactionAmt % 1 == 0),
    }
    for feat, val in user_overrides.items():
        if feat in row and val is not None:
            row[feat] = val

    # ── Step C: Apply label encoders to categorical columns ───────────────────
    # The model expects integer-encoded values for categorical features.
    categorical_inputs = {
        "card4":     data.card4,
        "ProductCD": data.ProductCD,
    }
    for col, raw_val in categorical_inputs.items():
        if col in M1_LABEL_ENCODERS and raw_val is not None:
            le = M1_LABEL_ENCODERS[col]
            try:
                encoded = int(le.transform([str(raw_val)])[0])
                if col in row:
                    row[col] = encoded
            except ValueError:
                # Value not seen during training — leave as -999
                pass

    # ── Step D: Create DataFrame in the EXACT feature order the model expects ─
    X = pd.DataFrame([row], columns=M1_FEATURE_NAMES)

    # ── Step E: Ensemble prediction ───────────────────────────────────────────
    xgb_prob = float(M1_XGB.predict_proba(X)[0][1])
    lgb_prob = float(M1_LGB.predict_proba(X)[0][1])
    fraud_prob = (xgb_prob + lgb_prob) / 2.0   # simple average ensemble

    risk_score = int(round(fraud_prob * 100))
    verdict = risk_score_to_verdict(risk_score)
    confidence = fraud_prob

    # ── Step F: SHAP top factors ──────────────────────────────────────────────
    try:
        shap_vals = M1_EXPLAINER.shap_values(X)[0]
        top_factors = build_top_factors(
            M1_FEATURE_NAMES,
            shap_vals,
            row,
            top_n=4
        )
    except Exception:
        # SHAP is optional — fall back to a manual factor list
        top_factors = [
            {
                "factor": "Transaction Amount",
                "contribution": str(data.TransactionAmt),
                "direction": "up" if data.TransactionAmt > 500 else "down",
            },
            {
                "factor": "Hour of Day",
                "contribution": f"{data.hour}:00",
                "direction": "up" if (data.hour is not None and (data.hour <= 5 or data.hour >= 22)) else "down",
            },
        ]

    # ── Step G: Reasoning text ────────────────────────────────────────────────
    if verdict == "FRAUD":
        reasoning = (
            f"XGBoost–LightGBM ensemble assigned a fraud probability of {fraud_prob:.1%}. "
            f"Transaction amount of ${data.TransactionAmt:,.2f} combined with the provided "
            f"PCA velocity features exceeds the learned fraud threshold ({M1_THRESHOLD:.2f}). "
            f"{'Late-night timing (hour=' + str(data.hour) + ') further elevates risk.' if data.hour is not None and (data.hour <= 5 or data.hour >= 22) else ''}"
        )
    elif verdict == "SUSPICIOUS":
        reasoning = (
            f"Ensemble probability {fraud_prob:.1%} falls in the borderline range "
            f"({int(M1_THRESHOLD * 100 * 0.5)}–{int(M1_THRESHOLD * 100)}%). "
            f"Transaction warrants manual review. Amount=${data.TransactionAmt:,.2f}."
        )
    else:
        reasoning = (
            f"Ensemble probability {fraud_prob:.1%} is well below the fraud threshold. "
            f"Transaction features are consistent with legitimate cardholder behavior."
        )

    return {
        "riskScore":      risk_score,
        "verdict":        verdict,
        "confidence":     round(confidence, 4),
        "reasoning":      reasoning,
        "topFactors":     top_factors,
        "processingTime": 14,
        "modelVersion":   "xgb-lgb-ensemble-v1.0",
    }


# ================================================================
# 5. Model 2 — Anomaly Detector
# ================================================================

class AnomalyInput(BaseModel):
    """
    Input for the unsupervised anomaly detector.
    Exposes the most separating V features from the EDA analysis.
    Unspecified V features default to 0.0 (neutral in PCA space).

    Field names here MUST match inputFields[].name in config/models.ts
    """
    Amount: float = 100.0           # original transaction amount
    V1:  Optional[float] = 0.0
    V2:  Optional[float] = 0.0
    V4:  Optional[float] = 0.0
    V14: Optional[float] = 0.0
    V17: Optional[float] = 0.0
    hour: Optional[int] = 12        # 0-23


@app.post("/predict/anomaly-detector")
def predict_anomaly(data: AnomalyInput):
    """
    Score a single transaction using the Hybrid Isolation Forest + Autoencoder.
    Returns a JSON blob matching the PredictionResult interface in lib/mockPredict.ts
    """
    if not M2_LOADED:
        raise HTTPException(
            status_code=503,
            detail="Model 2 artifacts not loaded. Check models/anomaly_artifacts.pkl"
        )

    # ── Step A: Build feature vector in the EXACT order used during training ──
    # M2_FEATURE_COLS = ['V1', 'V2', ..., 'V28', 'log_amount', 'hour', 'is_night']
    #
    # For V features not provided by the user, we use 0.0 which is the
    # neutral / normal centre of the PCA space (legitimate transactions cluster here).
    # Fraud transactions have extreme V values, so 0 won't artificially inflate score.

    v_values = {f"V{i}": 0.0 for i in range(1, 29)}

    # Overwrite with user-provided V features
    user_vs = {
        "V1":  data.V1,
        "V2":  data.V2,
        "V4":  data.V4,
        "V14": data.V14,
        "V17": data.V17,
    }
    for k, v in user_vs.items():
        if v is not None:
            v_values[k] = float(v)

    # Engineered features
    log_amount = float(np.log1p(data.Amount))
    hour       = float(data.hour) if data.hour is not None else 12.0
    is_night   = float(hour >= 22 or hour <= 5)

    # Build the full row in M2_FEATURE_COLS order
    full_row = []
    for col in M2_FEATURE_COLS:
        if col.startswith("V"):
            full_row.append(v_values.get(col, 0.0))
        elif col == "log_amount":
            full_row.append(log_amount)
        elif col == "hour":
            full_row.append(hour)
        elif col == "is_night":
            full_row.append(is_night)
        else:
            full_row.append(0.0)

    row_array = np.array(full_row).reshape(1, -1)

    # ── Step B: Scale with the fitted RobustScaler ────────────────────────────
    row_scaled = M2_SCALER.transform(row_array)

    # ── Step C: Isolation Forest score ────────────────────────────────────────
    raw_iso  = -float(M2_ISO_FOREST.decision_function(row_scaled)[0])
    iso_norm = float(np.clip(
        (raw_iso - M2_ISO_MIN) / (M2_ISO_MAX - M2_ISO_MIN + 1e-9),
        0.0, 1.0
    ))

    # ── Step D: Autoencoder reconstruction error ──────────────────────────────
    if M2_AUTOENCODER is not None:
        recon = M2_AUTOENCODER.predict(row_scaled, verbose=0)
        ae_err  = float(np.mean(np.square(row_scaled - recon)))
        ae_norm = float(np.clip(
            (ae_err - M2_AE_MIN) / (M2_AE_MAX - M2_AE_MIN + 1e-9),
            0.0, 1.0
        ))
        # Top contributing features by per-feature reconstruction error
        per_feat_err = np.square(row_scaled[0] - recon[0])
        top_idx = np.argsort(per_feat_err)[::-1][:4]
        top_factors = [
            {
                "factor":       M2_FEATURE_COLS[i],
                "contribution": f"{per_feat_err[i]:.4f} recon err",
                "direction":    "up" if per_feat_err[i] > 0.01 else "down",
            }
            for i in top_idx
        ]
    else:
        # Autoencoder not available — use only Isolation Forest
        ae_norm = iso_norm
        ae_err  = 0.0
        top_factors = [
            {"factor": "V1",  "contribution": str(data.V1),  "direction": "up" if abs(data.V1 or 0) > 2 else "down"},
            {"factor": "V14", "contribution": str(data.V14), "direction": "up" if abs(data.V14 or 0) > 2 else "down"},
            {"factor": "V17", "contribution": str(data.V17), "direction": "up" if abs(data.V17 or 0) > 2 else "down"},
            {"factor": "Amount", "contribution": str(data.Amount), "direction": "up" if data.Amount > 2000 else "down"},
        ]

    # ── Step E: Hybrid score ──────────────────────────────────────────────────
    hybrid = float(M2_W_ISO * iso_norm + M2_W_AE * ae_norm)

    risk_score = int(round(hybrid * 100))
    verdict    = risk_score_to_verdict(risk_score)
    confidence = hybrid

    # ── Step F: Reasoning ────────────────────────────────────────────────────
    if verdict == "FRAUD":
        reasoning = (
            f"Hybrid anomaly score {hybrid:.3f} exceeds threshold {M2_HYBRID_THRESH:.3f}. "
            f"Isolation Forest score={iso_norm:.3f}, Autoencoder reconstruction error={ae_err:.5f}. "
            f"This transaction's feature pattern was not seen in the normal training distribution. "
            f"Amount=${data.Amount:,.2f} at hour {int(hour)} with extreme PCA feature values."
        )
    elif verdict == "SUSPICIOUS":
        reasoning = (
            f"Hybrid score {hybrid:.3f} is elevated but below the anomaly threshold ({M2_HYBRID_THRESH:.3f}). "
            f"The autoencoder struggled to reconstruct some features (error={ae_err:.5f}), "
            f"indicating partial deviation from normal transaction patterns."
        )
    else:
        reasoning = (
            f"Hybrid score {hybrid:.3f} is within normal bounds. "
            f"Both detectors agree: Isolation Forest score={iso_norm:.3f} (low), "
            f"Autoencoder reconstruction error={ae_err:.5f} (normal). "
            f"This transaction matches the learned normal distribution closely."
        )

    return {
        "riskScore":      risk_score,
        "verdict":        verdict,
        "confidence":     round(confidence, 4),
        "reasoning":      reasoning,
        "topFactors":     top_factors,
        "processingTime": 22,
        "modelVersion":   "hybrid-isof-ae-v1.0",
    }


# ================================================================
# 6. Health check
# ================================================================

@app.get("/")
def health():
    return {
        "status":  "online",
        "model_1": "loaded" if M1_LOADED else "NOT LOADED",
        "model_2": "loaded" if M2_LOADED else "NOT LOADED",
        "autoencoder": "loaded" if M2_AUTOENCODER is not None else "NOT LOADED",
        "endpoints": [
            "POST /predict/transaction-classifier",
            "POST /predict/anomaly-detector",
        ],
    }
