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
  // Consent for irreversible deletes/merges. 'ask' (default) prompts the user;
  // 'allow' runs without asking. ('block' is a tolerated legacy value → 'ask'.)
  destructiveOps?: 'allow' | 'ask' | 'block';
  memoryEnabled?: boolean;
  maxSteps?: number;
  temperature?: number;
  isEnabled?: boolean;
  createdBy?: string;
}

export interface IMastraAgentDocument
  extends IMastraAgent, Omit<Document, 'model'> {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
