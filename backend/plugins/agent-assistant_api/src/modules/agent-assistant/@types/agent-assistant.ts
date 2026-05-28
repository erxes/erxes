import { Document } from 'mongoose';

export interface IAgentAssistant {
  name: string;
  description?: string;
  modelProvider: string;
  apiKey: string;
  status: string;
}

export interface IAgentAssistantDocument extends IAgentAssistant, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
