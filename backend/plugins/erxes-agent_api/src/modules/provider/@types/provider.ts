import { Document } from 'mongoose';

export interface IMastraProvider {
  provider: string;
  label?: string;
  apiKey?: string;
  baseUrl?: string;
  isDefault?: boolean;
  isEnabled?: boolean;
  isOpenAICompatible?: boolean;
  modelsEndpoint?: string;
  envKey?: string;
  headers?: Record<string, string>;
}

export interface IMastraProviderDocument extends IMastraProvider, Document {
  _id: string;
  createdAt: Date;
}
