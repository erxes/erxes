export interface IEmailRampStatus {
  tier: number;
  tiers: number[];
  dailyBudget: number;
  usedToday: number;

  haltedAt?: string;
  haltReason?: string;

  lastRate?: number;
  lastEvaluatedAt?: string;

  advanceRate: number;
  dropRate: number;
  haltRate: number;
  windowDays: number;
}
