import { Document } from 'mongoose';

export interface IAgent {
  name?: string;
}

export interface IAgentDocument extends IAgent, Document {
  createdAt: Date;
  updatedAt: Date;
}
