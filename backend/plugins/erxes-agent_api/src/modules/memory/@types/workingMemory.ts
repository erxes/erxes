import { Document } from 'mongoose';

// A persistent, per-(user, agent) profile the agent maintains across sessions.
export interface IMastraWorkingMemory {
  resourceId: string;
  agentId: string;
  content: string;
  updatedAt?: Date;
}

export interface IMastraWorkingMemoryDocument
  extends IMastraWorkingMemory, Document {
  _id: string;
}
