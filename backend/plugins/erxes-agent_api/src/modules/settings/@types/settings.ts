import { Document } from 'mongoose';

export interface IKnowledgeSyncStatus {
  lastSweepAt?: Date;
  pointCount?: number;
  /** Per-content-type sweep status: { [type]: { count, points, error? } } */
  types?: Record<string, { count: number; points: number; error?: string }>;
  lastError?: string | null;
}

export interface IMastraSettings {
  erxesApiUrl?: string;
  erxesApiToken?: string;
  defaultAgentId?: string;
  knowledgeSyncStatus?: IKnowledgeSyncStatus;
}

export interface IMastraSettingsDocument extends IMastraSettings, Document {
  _id: string;
}
