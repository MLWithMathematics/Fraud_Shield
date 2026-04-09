// ============================================================
// lib/types.ts — Shared types for Agency Features
// ============================================================

export type CaseStatus = "OPEN" | "INVESTIGATING" | "ESCALATED" | "RESOLVED" | "FALSE_POSITIVE";
export type CasePriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Verdict = "FRAUD" | "SUSPICIOUS" | "SAFE";
export type FeedbackLabel = "TRUE_POSITIVE" | "FALSE_POSITIVE" | "TRUE_NEGATIVE" | "FALSE_NEGATIVE";

export interface CaseNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface FraudCase {
  id: string;
  title: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  transactionAmt: number;
  combinedScore: number;
  verdict: Verdict;
  riskLevel: RiskLevel;
  notes: CaseNote[];
  modelScores: { model1: number; model2: number; model3: number };
  tags: string[];
  sourceAlertId?: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  transactionAmt: number;
  combinedScore: number;
  riskLevel: RiskLevel;
  verdict: Verdict;
  modelScores: { model1: number; model2: number; model3: number };
  caseId?: string;
  acknowledged: boolean;
}

export interface FeedbackEntry {
  id: string;
  modelId: string;
  predictedScore: number;
  label: FeedbackLabel;
  timestamp: string;
  analystNote?: string;
}

export interface BatchRow {
  id: string;
  index: number;
  input: Record<string, string | number>;
  result?: {
    combinedScore: number;
    riskLevel: RiskLevel;
    verdict: Verdict;
    model1Score: number;
    model2Score: number;
    model3Score: number;
  };
  status: "pending" | "scoring" | "done" | "error";
  error?: string;
}

// ============================================================
// RULE ENGINE
// ============================================================

export type RuleOperator = ">" | "<" | ">=" | "<=" | "==" | "!=";
export type RuleField =
  | "combinedScore"
  | "model1Score"
  | "model2Score"
  | "model3Score"
  | "transactionAmt"
  | "verdict"
  | "riskLevel";
export type RuleLogic = "AND" | "OR";
export type RuleAction = "AUTO_BLOCK" | "ESCALATE" | "FLAG" | "CREATE_CASE" | "ALERT";

export interface RuleCondition {
  id: string;
  field: RuleField;
  operator: RuleOperator;
  value: string;
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  logic: RuleLogic;
  conditions: RuleCondition[];
  action: RuleAction;
  priority: number;
  triggerCount: number;
  createdAt: string;
  lastTriggered?: string;
}

// ============================================================
// AUDIT LOG
// ============================================================

export type AuditActionType =
  | "RULE_CREATED"
  | "RULE_UPDATED"
  | "RULE_DELETED"
  | "RULE_TRIGGERED"
  | "CASE_CREATED"
  | "CASE_UPDATED"
  | "CASE_DELETED"
  | "ALERT_ACKNOWLEDGED"
  | "ALERT_CASE_CREATED"
  | "PREDICTION_MADE"
  | "BATCH_RUN"
  | "FEEDBACK_SUBMITTED"
  | "THRESHOLD_CHANGED"
  | "SYSTEM_LOGIN";

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditActionType;
  actor: string;
  entityId?: string;
  entityType?: string;
  detail: string;
  severity: "INFO" | "WARN" | "CRITICAL";
  metadata?: Record<string, string | number>;
}
