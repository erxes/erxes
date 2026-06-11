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
  // Chat file attachments: rides on the instance's existing upload storage
  // (S3/R2/Azure/GCS/local, configured in core). Defaults to on; only
  // effective when that storage is actually configured.
  attachmentsEnabled?: boolean;
  knowledgeSyncStatus?: IKnowledgeSyncStatus;
}

export interface IMastraSettingsDocument extends IMastraSettings, Document {
  _id: string;
}
