export interface IEmailRampStatus {
  /** Index into `tiers`. */
  tier: number;
  tiers: number[];
  dailyBudget: number;
  usedToday: number;

  haltedAt?: string;
  haltReason?: string;

  /** Bounce and complaint rate over the window, as a percentage. */
  lastRate?: number;
  lastEvaluatedAt?: string;

  advanceRate: number;
  dropRate: number;
  haltRate: number;
  windowDays: number;
}
