import { Document } from 'mongoose';

export interface IMastraSettings {
  erxesApiUrl?: string;
  erxesApiToken?: string;
  defaultAgentId?: string;
  memoryDbPath?: string;
}

export interface IMastraSettingsDocument extends IMastraSettings, Document {
  _id: string;
}
