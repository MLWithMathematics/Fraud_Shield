// ============================================================
// lib/auditStore.ts — Immutable audit trail
// ============================================================
import type { AuditEntry, AuditActionType } from "./types";

const KEY = "fs_audit_v1";
const MAX_ENTRIES = 500;

function load(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as AuditEntry[]; }
  catch { return []; }
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Severity helper ───────────────────────────────────────────────
function deriveSeverity(action: AuditActionType): AuditEntry["severity"] {
  if (
    action === "RULE_TRIGGERED" ||
    action === "CASE_CREATED" ||
    action === "ALERT_CASE_CREATED"
  )
    return "WARN";
  if (
    action === "RULE_DELETED" ||
    action === "CASE_DELETED" ||
    action === "THRESHOLD_CHANGED"
  )
    return "CRITICAL";
  return "INFO";
}

// ── Push an entry ─────────────────────────────────────────────────
export function pushAudit(
  action: AuditActionType,
  detail: string,
  options?: {
    actor?: string;
    entityId?: string;
    entityType?: string;
    metadata?: Record<string, string | number>;
    severity?: AuditEntry["severity"];
  }
): AuditEntry {
  const entry: AuditEntry = {
    id: uid(),
    timestamp: new Date().toISOString(),
    action,
    detail,
    actor: options?.actor ?? "Analyst",
    entityId: options?.entityId,
    entityType: options?.entityType,
    severity: options?.severity ?? deriveSeverity(action),
    metadata: options?.metadata,
  };
  const all = load();
  const trimmed = [entry, ...all].slice(0, MAX_ENTRIES);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  }
  return entry;
}

// ── Read entries ──────────────────────────────────────────────────
export function getAuditLog(): AuditEntry[] {
  return load();
}

export function clearAuditLog(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify([]));
}

// ── Seed realistic demo entries ───────────────────────────────────
export function seedAuditLog(): void {
  if (load().length > 0) return;

  const now = Date.now();
  const demos: Array<{
    action: AuditActionType;
    detail: string;
    actor: string;
    entityType: string;
    minsAgo: number;
  }> = [
    { action: "SYSTEM_LOGIN",         detail: "Analyst logged in from 192.168.1.42",              actor: "Alex R.",    entityType: "session",     minsAgo: 2   },
    { action: "ALERT_ACKNOWLEDGED",   detail: "Alert ALT-KX3F9 acknowledged (CRITICAL)",           actor: "Alex R.",    entityType: "alert",       minsAgo: 5   },
    { action: "ALERT_CASE_CREATED",   detail: "Case CASE-AB12 created from Alert ALT-KX3F9",       actor: "Alex R.",    entityType: "case",        minsAgo: 6   },
    { action: "CASE_UPDATED",         detail: "Case CASE-AB12 status → INVESTIGATING",             actor: "Alex R.",    entityType: "case",        minsAgo: 8   },
    { action: "RULE_TRIGGERED",       detail: "Rule 'High-value night fraud' fired — score 88",    actor: "System",     entityType: "rule",        minsAgo: 12  },
    { action: "PREDICTION_MADE",      detail: "Combined risk engine scored txn $4850 → 88 FRAUD",  actor: "System",     entityType: "prediction",  minsAgo: 12  },
    { action: "FEEDBACK_SUBMITTED",   detail: "TRUE_POSITIVE submitted for TransactionGuard",      actor: "Priya S.",   entityType: "feedback",    minsAgo: 20  },
    { action: "CASE_CREATED",         detail: "Case CASE-XY99 opened — ATO pattern detected",      actor: "Jordan M.",  entityType: "case",        minsAgo: 35  },
    { action: "RULE_CREATED",         detail: "Rule 'ATO Behavioural Escalation' created",         actor: "Alex R.",    entityType: "rule",        minsAgo: 60  },
    { action: "BATCH_RUN",            detail: "Batch job scored 42 transactions — 6 CRITICAL",     actor: "Priya S.",   entityType: "batch",       minsAgo: 90  },
    { action: "THRESHOLD_CHANGED",    detail: "TransactionGuard threshold 50 → 45 (more recall)",  actor: "Jordan M.",  entityType: "model",       minsAgo: 120 },
    { action: "CASE_UPDATED",         detail: "Case CASE-XY99 escalated to CRITICAL",              actor: "Jordan M.",  entityType: "case",        minsAgo: 150 },
    { action: "RULE_UPDATED",         detail: "Rule 'Anomaly-only flag' conditions updated",       actor: "Sam K.",     entityType: "rule",        minsAgo: 200 },
    { action: "ALERT_ACKNOWLEDGED",   detail: "8 LOW-risk alerts bulk-acknowledged",               actor: "Sam K.",     entityType: "alert",       minsAgo: 240 },
    { action: "CASE_UPDATED",         detail: "Case CASE-VW55 marked RESOLVED — confirmed FP",     actor: "Taylor W.",  entityType: "case",        minsAgo: 300 },
    { action: "FEEDBACK_SUBMITTED",   detail: "FALSE_POSITIVE submitted for AnomalyNet (score 52)", actor: "Taylor W.", entityType: "feedback",    minsAgo: 360 },
    { action: "SYSTEM_LOGIN",         detail: "Analyst logged in from 10.0.0.15",                  actor: "Priya S.",   entityType: "session",     minsAgo: 480 },
    { action: "RULE_DELETED",         detail: "Rule 'Legacy card-not-present' deleted",            actor: "Alex R.",    entityType: "rule",        minsAgo: 720 },
    { action: "BATCH_RUN",            detail: "Batch job scored 118 historical txns — 12 FRAUD",   actor: "Jordan M.",  entityType: "batch",       minsAgo: 1440},
  ];

  const entries: AuditEntry[] = demos.map((d) => ({
    id: uid(),
    timestamp: new Date(now - d.minsAgo * 60 * 1000).toISOString(),
    action: d.action,
    detail: d.detail,
    actor: d.actor,
    entityType: d.entityType,
    severity: deriveSeverity(d.action),
  }));

  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(entries));
  }
}
