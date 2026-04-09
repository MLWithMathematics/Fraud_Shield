// ============================================================
// lib/caseStore.ts — Agency Suite shared state (localStorage)
// Used by: Navbar, /alerts, /cases, /batch, /performance
// ============================================================

export type AlertSeverity  = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type AlertVerdict   = "FRAUD" | "SUSPICIOUS" | "SAFE";
export type CaseStatus     = "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
export type CasePriority   = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type FeedbackLabel  = "TRUE_POSITIVE" | "FALSE_POSITIVE" | "TRUE_NEGATIVE" | "FALSE_NEGATIVE";

// ── Core Types ────────────────────────────────────────────────
export interface Alert {
  id:            string;
  timestamp:     number;
  transactionId: string;
  amount:        number;
  riskScore:     number;
  severity:      AlertSeverity;
  verdict:       AlertVerdict;
  model1Score:   number;
  model2Score:   number;
  model3Score:   number;
  acknowledged:  boolean;
  caseId?:       string;
  country?:      string;
  cardNetwork?:  string;
  hour?:         number;
}

export interface CaseNote {
  id:        string;
  timestamp: number;
  analyst:   string;
  text:      string;
}

export interface Case {
  id:            string;
  alertId:       string;
  transactionId: string;
  amount:        number;
  riskScore:     number;
  status:        CaseStatus;
  priority:      CasePriority;
  assignedTo:    string;
  createdAt:     number;
  updatedAt:     number;
  notes:         CaseNote[];
  verdict?:      FeedbackLabel;
  tags:          string[];
}

export interface FeedbackEntry {
  id:               string;
  alertId:          string;
  modelId:          string;
  predictedVerdict: AlertVerdict;
  actualLabel:      FeedbackLabel;
  riskScore:        number;
  timestamp:        number;
  analyst:          string;
}

// ── localStorage helpers ──────────────────────────────────────
const ALERTS_KEY   = "fs_alerts_v2";
const CASES_KEY    = "fs_cases_v2";
const FEEDBACK_KEY = "fs_feedback_v2";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ── Alerts ───────────────────────────────────────────────────
export function getAlerts(): Alert[] {
  return load<Alert[]>(ALERTS_KEY, []);
}
export function addAlert(alert: Alert): void {
  const list = getAlerts();
  list.unshift(alert);
  if (list.length > 300) list.splice(300);
  save(ALERTS_KEY, list);
}
export function acknowledgeAlert(id: string): void {
  const list = getAlerts();
  const a = list.find((x) => x.id === id);
  if (a) { a.acknowledged = true; save(ALERTS_KEY, list); }
}
export function linkAlertToCase(alertId: string, caseId: string): void {
  const list = getAlerts();
  const a = list.find((x) => x.id === alertId);
  if (a) { a.caseId = caseId; save(ALERTS_KEY, list); }
}

// ── Cases ────────────────────────────────────────────────────
export function getCases(): Case[] {
  return load<Case[]>(CASES_KEY, []);
}
export function addCase(c: Case): void {
  const list = getCases();
  list.unshift(c);
  save(CASES_KEY, list);
}
export function updateCase(id: string, patch: Partial<Case>): void {
  const list = getCases();
  const idx = list.findIndex((c) => c.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...patch, updatedAt: Date.now() };
    save(CASES_KEY, list);
  }
}
export function addCaseNote(caseId: string, note: CaseNote): void {
  const list = getCases();
  const c = list.find((x) => x.id === caseId);
  if (c) { c.notes.push(note); c.updatedAt = Date.now(); save(CASES_KEY, list); }
}

// ── Feedback ─────────────────────────────────────────────────
export function getFeedback(): FeedbackEntry[] {
  return load<FeedbackEntry[]>(FEEDBACK_KEY, []);
}
export function addFeedback(entry: FeedbackEntry): void {
  const list = getFeedback();
  list.push(entry);
  save(FEEDBACK_KEY, list);
}

// ── Utilities ────────────────────────────────────────────────
export function genId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
export function scoreToSeverity(score: number): AlertSeverity {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}
export function scoreToVerdict(score: number): AlertVerdict {
  if (score >= 70) return "FRAUD";
  if (score >= 35) return "SUSPICIOUS";
  return "SAFE";
}

// ── Mock alert generator (used by Live Alert Queue) ──────────
const COUNTRIES   = ["US", "GB", "DE", "CN", "NG", "RU", "BR", "IN", "FR", "AU", "MX", "JP"];
const CARDS       = ["visa", "mastercard", "discover", "american express"];
const MERCHANTS   = ["Amazon", "AliExpress", "Steam", "Binance", "Unknown Merchant", "PayPal", "Shopify Store"];

export function generateMockAlert(): Alert {
  // Skew toward interesting (higher risk) alerts for demo value
  const roll = Math.random();
  let riskScore: number;
  if (roll < 0.15)       riskScore = 75 + Math.floor(Math.random() * 25); // CRITICAL
  else if (roll < 0.35)  riskScore = 50 + Math.floor(Math.random() * 25); // HIGH
  else if (roll < 0.60)  riskScore = 25 + Math.floor(Math.random() * 25); // MEDIUM
  else                   riskScore = Math.floor(Math.random() * 25);       // LOW

  const m1 = Math.min(100, Math.max(0, riskScore + Math.floor((Math.random() - 0.5) * 30)));
  const m2 = Math.min(100, Math.max(0, riskScore + Math.floor((Math.random() - 0.5) * 30)));
  const m3 = Math.min(100, Math.max(0, riskScore + Math.floor((Math.random() - 0.5) * 30)));
  const amount = parseFloat((Math.random() * 4990 + 10).toFixed(2));
  const hour   = Math.floor(Math.random() * 24);

  return {
    id:            genId("alert"),
    timestamp:     Date.now(),
    transactionId: `TXN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    amount,
    riskScore,
    severity:      scoreToSeverity(riskScore),
    verdict:       scoreToVerdict(riskScore),
    model1Score:   m1,
    model2Score:   m2,
    model3Score:   m3,
    acknowledged:  false,
    country:       COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
    cardNetwork:   CARDS[Math.floor(Math.random() * CARDS.length)],
    hour,
  };
}
