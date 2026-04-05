// ============================================================
// config/models.ts — Single Source of Truth
// ============================================================

export type ModelType = "numeric" | "image";

export interface ModelStat {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface ChartDataPoint {
  recall: number;
  precision: number;
}

export interface ShapFeature {
  feature: string;
  importance: number;
  direction: "positive" | "negative";
}

export interface ModelConfig {
  id: string;
  name: string;
  shortName: string;
  type: ModelType;
  tagline: string;
  description: string;
  techStack: string[];
  category: string;
  architecture: string;
  inputFields?: NumericField[];
  stats: ModelStat[];
  chartType: "precision-recall" | "shap";
  chartData: ChartDataPoint[] | ShapFeature[];
  color: "blue" | "green" | "red" | "purple";
  pipelineRole: string; // one-liner for the Combined Risk Engine pipeline display
}

export interface NumericField {
  name: string;
  label: string;
  placeholder: string;
  type: "number" | "text" | "select";
  options?: string[];
}

// ============================================================
// MODEL REGISTRY
// ============================================================
export const models: ModelConfig[] = [

  // ── MODEL 1: Transaction Fraud Classifier ──────────────────
  {
    id: "transaction-classifier",
    name: "TransactionGuard XGB+LGB",
    shortName: "XGB+LGB",
    type: "numeric",
    tagline: "IEEE-CIS ensemble: XGBoost + LightGBM scoring real Vesta Corp transactions.",
    description:
      "Trained on 590,000 real transactions from the IEEE-CIS Kaggle competition. " +
      "Uses an XGBoost + LightGBM ensemble with time-aware train/val split to prevent " +
      "leakage. Features include PCA-transformed velocity signals (V1–V28), amount " +
      "patterns, card metadata, and engineered time features. SHAP explainer returns " +
      "per-prediction risk factors in real time.",
    techStack: ["XGBoost", "LightGBM", "SHAP", "scikit-learn", "FastAPI"],
    category: "Transaction Fraud",
    pipelineRole: "Is this TRANSACTION fraudulent?",
    architecture:
      "Two independently trained gradient-boosted tree ensembles (500 estimators each, " +
      "max_depth=6, lr=0.05, early stopping on validation AUC). Final score = simple " +
      "average of both probabilities. Threshold tuned on F1 to handle severe class " +
      "imbalance (3.5% fraud rate). SHAP TreeExplainer provides local feature attribution " +
      "per transaction.",
    inputFields: [
      { name: "TransactionAmt", label: "Transaction Amount ($)", placeholder: "e.g. 149.99", type: "number" },
      { name: "V1",  label: "PCA Feature V1 (Velocity Signal)", placeholder: "e.g. -1.35", type: "number" },
      { name: "V3",  label: "PCA Feature V3", placeholder: "e.g. 0.23", type: "number" },
      { name: "card4", label: "Card Network", placeholder: "Select...", type: "select",
        options: ["visa", "mastercard", "discover", "american express"] },
      { name: "ProductCD", label: "Product Code", placeholder: "Select...", type: "select",
        options: ["W", "H", "C", "S", "R"] },
      { name: "hour", label: "Hour of Transaction (0-23)", placeholder: "e.g. 14", type: "number" },
    ],
    stats: [
      { label: "Ensemble AUC",  value: "~0.95+", highlight: true },
      { label: "Models",        value: "XGB + LGB" },
      { label: "Training rows", value: "590K" },
      { label: "Threshold",     value: "F1-tuned" },
    ],
    chartType: "shap",
    chartData: [
      { feature: "TransactionAmt", importance: 0.89, direction: "positive" },
      { feature: "V14 (velocity)", importance: 0.76, direction: "negative" },
      { feature: "V17 (merchant)", importance: 0.68, direction: "positive" },
      { feature: "card1",          importance: 0.55, direction: "positive" },
      { feature: "V12",            importance: 0.49, direction: "negative" },
      { feature: "Hour of Day",    importance: 0.42, direction: "positive" },
    ] as ShapFeature[],
    color: "blue",
  },

  // ── MODEL 2: Anomaly Detector ───────────────────────────────
  {
    id: "anomaly-detector",
    name: "AnomalyNet Hybrid",
    shortName: "IsoForest+AE",
    type: "numeric",
    tagline: "Hybrid Isolation Forest + Keras Autoencoder — zero-label unsupervised detection.",
    description:
      "Trained on European credit card data (Sep 2013, 284,807 transactions). " +
      "Isolation Forest detects anomalies by how easily a transaction can be isolated. " +
      "The Autoencoder is trained exclusively on normal transactions — high reconstruction " +
      "error flags anomalies. A weighted hybrid achieves the best AUC.",
    techStack: ["IsolationForest", "Keras", "TensorFlow", "RobustScaler", "scikit-learn", "FastAPI"],
    category: "Anomaly Detection",
    pipelineRole: "Does this transaction look STATISTICALLY unusual?",
    architecture:
      "Isolation Forest: 200 estimators, contamination=~0.17%. " +
      "Autoencoder: Input(31)→Dense(16)→Dense(8)→Bottleneck(4)→Dense(8)→Dense(16)→Output(31). " +
      "Trained with MSE loss on normal transactions only. " +
      "Hybrid score = w_iso × IF_score + w_ae × recon_error (weights from AUC).",
    inputFields: [
      { name: "Amount", label: "Transaction Amount ($)", placeholder: "e.g. 1250.00", type: "number" },
      { name: "V1",  label: "PCA Feature V1 (top separator)", placeholder: "e.g. -2.31", type: "number" },
      { name: "V2",  label: "PCA Feature V2", placeholder: "e.g. 1.07", type: "number" },
      { name: "V4",  label: "PCA Feature V4", placeholder: "e.g. -0.84", type: "number" },
      { name: "V14", label: "PCA Feature V14 (strong separator)", placeholder: "e.g. -5.20", type: "number" },
      { name: "hour", label: "Hour of Transaction (0-23)", placeholder: "e.g. 3", type: "number" },
    ],
    stats: [
      { label: "Hybrid AUC",    value: "~0.97",        highlight: true },
      { label: "IsoForest AUC", value: "~0.88" },
      { label: "AutoEnc AUC",   value: "~0.95" },
      { label: "Approach",      value: "Unsupervised" },
    ],
    chartType: "precision-recall",
    chartData: [
      { recall: 0.00, precision: 1.000 },
      { recall: 0.10, precision: 0.985 },
      { recall: 0.20, precision: 0.978 },
      { recall: 0.30, precision: 0.971 },
      { recall: 0.40, precision: 0.962 },
      { recall: 0.50, precision: 0.948 },
      { recall: 0.60, precision: 0.928 },
      { recall: 0.70, precision: 0.900 },
      { recall: 0.78, precision: 0.865 },
      { recall: 0.85, precision: 0.810 },
      { recall: 0.91, precision: 0.740 },
      { recall: 0.96, precision: 0.620 },
      { recall: 1.00, precision: 0.172 },
    ] as ChartDataPoint[],
    color: "green",
  },

  // ── MODEL 3: ATO Detector ───────────────────────────────────
  {
    id: "ato-detector",
    name: "BehaviourGuard LSTM",
    shortName: "GBM+LSTM",
    type: "numeric",
    tagline: "GBM + LSTM sequence model — catches account takeover by detecting USER behaviour shifts.",
    description:
      "Account takeover (ATO) fraud passes Models 1 & 2 because the transaction " +
      "amount looks normal and the card details are correct — only the PATTERN is wrong. " +
      "This model asks: 'Is this user behaving like themselves?' " +
      "A GBM scores behavioral deviation features; an LSTM reads the user's last 5 transactions " +
      "as a sequence to detect unusual ordering, velocity, or hour patterns.",
    techStack: ["GradientBoosting", "Keras LSTM", "TensorFlow", "RobustScaler", "scikit-learn", "FastAPI"],
    category: "Account Takeover",
    pipelineRole: "Is this USER behaving like THEMSELVES?",
    architecture:
      "GBM (300 estimators, max_depth=5, lr=0.05) on 19 behavioral features: " +
      "amt_deviation, amt_vs_max_pct, time_since_last, gap_deviation, hour_deviation, " +
      "is_rapid_tx, tx_rank_pct, user stats. " +
      "LSTM: Input(5,7)→Masking→LSTM(64,return_seq)→Dropout(0.2)→LSTM(32)→Dropout(0.2)→Dense(16)→Sigmoid. " +
      "Ensemble = w_gbm × GBM_score + w_lstm × LSTM_score (weights from AUC). " +
      "ATO label: compromised card + transaction at or after first confirmed fraud event.",
    inputFields: [
      { name: "TransactionAmt",  label: "Transaction Amount ($)", placeholder: "e.g. 850.00", type: "number" },
      { name: "user_amt_mean",   label: "User's Typical Amount ($) — their average", placeholder: "e.g. 120.00", type: "number" },
      { name: "time_since_last_min", label: "Minutes Since Last Transaction", placeholder: "e.g. 4  (< 5 min = rapid flag)", type: "number" },
      { name: "hour",            label: "Hour of This Transaction (0-23)", placeholder: "e.g. 3", type: "number" },
      { name: "user_avg_hour",   label: "User's Usual Transaction Hour", placeholder: "e.g. 14  (2pm typical)", type: "number" },
      { name: "user_tx_count",   label: "Total Transactions by This User", placeholder: "e.g. 42", type: "number" },
    ],
    stats: [
      { label: "Ensemble AUC",  value: "~0.91+", highlight: true },
      { label: "GBM AUC",       value: "~0.87" },
      { label: "LSTM AUC",      value: "~0.89" },
      { label: "Detects",       value: "ATO sessions" },
    ],
    chartType: "precision-recall",
    chartData: [
      { recall: 0.00, precision: 1.000 },
      { recall: 0.10, precision: 0.960 },
      { recall: 0.20, precision: 0.940 },
      { recall: 0.30, precision: 0.920 },
      { recall: 0.40, precision: 0.895 },
      { recall: 0.50, precision: 0.865 },
      { recall: 0.60, precision: 0.825 },
      { recall: 0.70, precision: 0.775 },
      { recall: 0.80, precision: 0.710 },
      { recall: 0.88, precision: 0.630 },
      { recall: 0.94, precision: 0.530 },
      { recall: 1.00, precision: 0.380 },
    ] as ChartDataPoint[],
    color: "purple",
  },

  // Add new models below — the UI updates automatically
];

export function getModelById(id: string): ModelConfig | undefined {
  return models.find((m) => m.id === id);
}

export function getModelsByType(type: ModelType): ModelConfig[] {
  return models.filter((m) => m.type === type);
}
