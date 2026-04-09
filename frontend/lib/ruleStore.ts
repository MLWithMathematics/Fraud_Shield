// ============================================================
// lib/ruleStore.ts — Rule Engine: CRUD + Evaluation
// ============================================================
import type { FraudRule, RuleCondition, RuleAction, RuleLogic } from "./types";

const KEY = "fs_rules_v1";

function load(): FraudRule[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as FraudRule[]; }
  catch { return []; }
}
function save(rules: FraudRule[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rules));
}
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── CRUD ─────────────────────────────────────────────────────────
export function getRules(): FraudRule[] {
  return load().sort((a, b) => a.priority - b.priority);
}

export function saveRule(rule: FraudRule): void {
  const all = load().filter((r) => r.id !== rule.id);
  save([...all, rule]);
}

export function createRule(
  partial: Pick<FraudRule, "name" | "description" | "logic" | "conditions" | "action">
): FraudRule {
  const all = load();
  const rule: FraudRule = {
    ...partial,
    id: "RULE-" + uid().toUpperCase(),
    enabled: true,
    priority: all.length + 1,
    triggerCount: 0,
    createdAt: new Date().toISOString(),
  };
  save([...all, rule]);
  return rule;
}

export function updateRule(id: string, updates: Partial<FraudRule>): void {
  const all = load();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...updates };
  save(all);
}

export function deleteRule(id: string): void {
  save(load().filter((r) => r.id !== id));
}

export function toggleRule(id: string): void {
  const all = load();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return;
  all[idx].enabled = !all[idx].enabled;
  save(all);
}

export function incrementTrigger(id: string): void {
  const all = load();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return;
  all[idx].triggerCount = (all[idx].triggerCount || 0) + 1;
  all[idx].lastTriggered = new Date().toISOString();
  save(all);
}

// ── Rule Evaluation ───────────────────────────────────────────────
export interface EvalInput {
  combinedScore: number;
  model1Score: number;
  model2Score: number;
  model3Score: number;
  transactionAmt: number;
  verdict: string;
  riskLevel: string;
}

function evalCondition(cond: RuleCondition, input: EvalInput): boolean {
  const raw = input[cond.field as keyof EvalInput];
  const numVal = parseFloat(String(raw));
  const condVal = parseFloat(cond.value);

  // Numeric comparisons
  if (!isNaN(numVal) && !isNaN(condVal)) {
    switch (cond.operator) {
      case ">":  return numVal > condVal;
      case "<":  return numVal < condVal;
      case ">=": return numVal >= condVal;
      case "<=": return numVal <= condVal;
      case "==": return numVal === condVal;
      case "!=": return numVal !== condVal;
    }
  }

  // String equality
  const strVal = String(raw).toUpperCase();
  const strCond = cond.value.toUpperCase();
  switch (cond.operator) {
    case "==": return strVal === strCond;
    case "!=": return strVal !== strCond;
    default:   return false;
  }
}

export interface RuleMatch {
  rule: FraudRule;
  action: RuleAction;
}

export function evaluateRules(input: EvalInput): RuleMatch[] {
  const rules = getRules().filter((r) => r.enabled && r.conditions.length > 0);
  const matches: RuleMatch[] = [];

  for (const rule of rules) {
    const results = rule.conditions.map((c) => evalCondition(c, input));
    const fired =
      rule.logic === "AND" ? results.every(Boolean) : results.some(Boolean);
    if (fired) {
      matches.push({ rule, action: rule.action });
      incrementTrigger(rule.id);
    }
  }
  return matches;
}

// ── Demo seed ─────────────────────────────────────────────────────
export function seedDemoRules(): void {
  if (load().length > 0) return;
  const demos: Array<Pick<FraudRule, "name" | "description" | "logic" | "conditions" | "action">> = [
    {
      name: "High-value night fraud",
      description: "Auto-block large transactions with critical combined score",
      logic: "AND",
      action: "AUTO_BLOCK",
      conditions: [
        { id: uid(), field: "combinedScore", operator: ">=", value: "80" },
        { id: uid(), field: "transactionAmt", operator: ">",  value: "2000" },
      ],
    },
    {
      name: "ATO Behavioural Escalation",
      description: "Escalate when BehaviourGuard fires high and combined is suspicious",
      logic: "AND",
      action: "ESCALATE",
      conditions: [
        { id: uid(), field: "model3Score",   operator: ">=", value: "75" },
        { id: uid(), field: "combinedScore", operator: ">=", value: "60" },
      ],
    },
    {
      name: "Anomaly-only flag",
      description: "Flag transactions where AnomalyNet is the sole trigger",
      logic: "AND",
      action: "FLAG",
      conditions: [
        { id: uid(), field: "model2Score", operator: ">=", value: "70" },
        { id: uid(), field: "model1Score", operator: "<",  value: "40" },
      ],
    },
    {
      name: "FRAUD verdict auto-case",
      description: "Auto-create case for any FRAUD verdict",
      logic: "AND",
      action: "CREATE_CASE",
      conditions: [
        { id: uid(), field: "verdict", operator: "==", value: "FRAUD" },
      ],
    },
  ];
  demos.forEach((d, i) => {
    const rule = createRule(d);
    updateRule(rule.id, { priority: i + 1, triggerCount: Math.floor(Math.random() * 40) });
  });
}
