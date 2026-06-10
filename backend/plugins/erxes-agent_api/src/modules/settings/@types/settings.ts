import { Document } from 'mongoose';

export interface IKnowledgeSyncStatus {
  lastSweepAt?: Date;
  articleCount?: number;
  pointCount?: number;
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
