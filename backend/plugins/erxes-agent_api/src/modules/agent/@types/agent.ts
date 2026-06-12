import { Document } from 'mongoose';

export interface IMastraAgent {
  name: string;
  agentId: string;
  description?: string;
  instructions?: string;
  provider: string;
  model: string;
  toolPolicy?: 'all' | 'custom';
  allowedTools?: string[];
  memoryEnabled?: boolean;
  maxSteps?: number;
  temperature?: number;
  isEnabled?: boolean;
}

export interface IMastraAgentDocument
  extends IMastraAgent, Omit<Document, 'model'> {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
