import { Document } from 'mongoose';

export type TLoyaltyPeriodRunStatus = 'running' | 'done' | 'failed';

export interface ILoyaltyPeriodRunCounts {
  // Pending lots that became spendable.
  released: number;
  // Lots whose points expired.
  expired: number;
  // Accounts reset for a new period.
  reset: number;
  // Lots or accounts that could not be moved and wait for the next run.
  failed: number;
}

// One period run of an organization; a run continued in batches stays one.
export interface ILoyaltyPeriodRun extends ILoyaltyPeriodRunCounts {
  startedAt: Date;
  finishedAt?: Date;
  status: TLoyaltyPeriodRunStatus;
  batches: number;
  error?: string;
}

export interface ILoyaltyPeriodRunDocument extends ILoyaltyPeriodRun, Document {
  _id: string;
}
