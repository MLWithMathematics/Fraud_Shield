// ============================================================
// config/models.ts — Single Source of Truth
// The entire UI is generated dynamically from this file.
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
  color: "blue" | "green" | "red";
}

export interface NumericField {
  name: string;
  label: string;
  placeholder: string;
  type: "number" | "text" | "select";
  options?: string[];
}

// ============================================================
// MODEL REGISTRY — only real, trained models live here
// ============================================================

export const models: ModelConfig[] = [

  // ── MODEL 1: Transaction Fraud Classifier ──────────────────
  {
    id: "transaction-classifier",
    name: "TransactionGuard XGB+LGB",
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
    architecture:
      "Two independently trained gradient-boosted tree ensembles (500 estimators each, " +
      "max_depth=6, lr=0.05, early stopping on validation AUC). Final score = simple " +
      "average of both probabilities. Threshold tuned on F1 to handle severe class " +
      "imbalance (3.5% fraud rate). SHAP TreeExplainer provides local feature attribution " +
      "per transaction. Missing values filled with -999 sentinel (native XGB/LGB support).",
    inputFields: [
      {
        name: "TransactionAmt",
        label: "Transaction Amount ($)",
        placeholder: "e.g. 149.99",
        type: "number",
      },
      {
        name: "V1",
        label: "PCA Feature V1 (Velocity Signal)",
        placeholder: "e.g. -1.35  (negative = higher risk)",
        type: "number",
      },
      {
        name: "V3",
        label: "PCA Feature V3",
        placeholder: "e.g. 0.23",
        type: "number",
      },
      {
        name: "card4",
        label: "Card Network",
        placeholder: "Select card network",
        type: "select",
        options: ["visa", "mastercard", "discover", "american express"],
      },
      {
        name: "ProductCD",
        label: "Product Code",
        placeholder: "Select product type",
        type: "select",
        options: ["W", "H", "C", "S", "R"],
      },
      {
        name: "hour",
        label: "Hour of Transaction (0-23)",
        placeholder: "e.g. 14  (late-night 0-5 is higher risk)",
        type: "number",
      },
    ],
    stats: [
      { label: "Ensemble AUC",  value: "~0.95+",    highlight: true },
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
    type: "numeric",
    tagline: "Hybrid Isolation Forest + Keras Autoencoder — zero-label unsupervised detection.",
    description:
      "Trained on European credit card data (Sep 2013, 284,807 transactions). " +
      "Isolation Forest detects anomalies by how easily a transaction can be " +
      "isolated from normal transactions. The Autoencoder is trained exclusively on " +
      "normal transactions — it learns to reconstruct them well, then flags anything " +
      "with high reconstruction error as suspicious. A weighted hybrid of both scores " +
      "achieves the best AUC. Catches zero-day fraud patterns the supervised model misses.",
    techStack: ["IsolationForest", "Keras", "TensorFlow", "RobustScaler", "scikit-learn", "FastAPI"],
    category: "Anomaly Detection",
    architecture:
      "Isolation Forest: 200 estimators, contamination=dataset fraud rate (~0.17%). " +
      "Autoencoder: Input(31) to Dense(16) to Dense(8) to Dense(4, bottleneck) to Dense(8) to Dense(16) to Output(31), " +
      "trained with MSE loss on normal transactions only, EarlyStopping on val_loss. " +
      "Hybrid score = w_iso x normalised_IF_score + w_ae x normalised_recon_error, " +
      "weights derived from each model's AUC on the test set.",
    inputFields: [
      {
        name: "Amount",
        label: "Transaction Amount ($)",
        placeholder: "e.g. 1250.00",
        type: "number",
      },
      {
        name: "V1",
        label: "PCA Feature V1 (top separator)",
        placeholder: "e.g. -2.31  (fraud clusters at extremes)",
        type: "number",
      },
      {
        name: "V2",
        label: "PCA Feature V2",
        placeholder: "e.g. 1.07",
        type: "number",
      },
      {
        name: "V4",
        label: "PCA Feature V4",
        placeholder: "e.g. -0.84",
        type: "number",
      },
      {
        name: "V14",
        label: "PCA Feature V14 (strong separator)",
        placeholder: "e.g. -5.20  (key fraud signal)",
        type: "number",
      },
      {
        name: "hour",
        label: "Hour of Transaction (0-23)",
        placeholder: "e.g. 3",
        type: "number",
      },
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

  // ────────────────────────────────────────────────────────────
  // Add new models below — the entire UI updates automatically
  // ────────────────────────────────────────────────────────────
];

export function getModelById(id: string): ModelConfig | undefined {
  return models.find((m) => m.id === id);
}

export function getModelsByType(type: ModelType): ModelConfig[] {
  return models.filter((m) => m.type === type);
}
