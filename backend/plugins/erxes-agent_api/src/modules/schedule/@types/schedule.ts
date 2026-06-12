import { Document } from 'mongoose';

export type MastraScheduleRunStatus = 'success' | 'failed' | 'skipped';

export interface IMastraSchedule {
  name: string;
  description?: string;
  // The MastraAgent.agentId this schedule runs.
  agentId: string;
  // 5-field cron expression (UTC unless timezone is set).
  cron: string;
  // IANA timezone the cron fires in; defaults to UTC.
  timezone?: string;
  // The user message sent to the agent on every run.
  prompt: string;
  isEnabled?: boolean;
  createdByUserId?: string;
  // Last-run bookkeeping, written by the runner after every fire.
  lastRunAt?: Date;
  lastStatus?: MastraScheduleRunStatus;
  lastError?: string;
  lastReply?: string;
  lastDurationMs?: number;
  runCount?: number;
}

export interface IMastraScheduleDocument extends IMastraSchedule, Document {
  _id: string;
  isEnabled: boolean;
  runCount: number;
  createdAt: Date;
  updatedAt: Date;
}
