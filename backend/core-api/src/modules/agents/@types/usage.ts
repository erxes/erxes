import { Document } from 'mongoose';

export interface IAgentsTokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface IAgentsUsage extends IAgentsTokenUsage {
  month: string;
}

export interface IAgentsUsageDocument extends IAgentsUsage, Document {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
