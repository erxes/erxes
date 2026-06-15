import { Document } from 'mongoose';

// One record per erxes MUTATION the agent attempted — executed, failed, or
// blocked by the destructive-ops guard. Reads are intentionally not logged
// (high volume, nothing to audit or revert). This is both an accountability
// trail and the seed of the future point-in-time revert journal.
export interface IMastraAgentActionLog {
  source: 'chat' | 'workflow';
  agentId?: string;
  workflowId?: string;
  operation: string;
  operationType: string;
  destructive?: boolean;
  // The mutation arguments. May contain business data by nature — it records
  // exactly what the agent changed.
  args?: Record<string, unknown>;
  status: 'success' | 'failed' | 'blocked';
  error?: string;
  // Reserved for revert correlation once agent runs are stamped with the erxes
  // request processId (Phase 2/3). Best-effort / unset for now.
  userId?: string;
  processId?: string;
}

export interface IMastraAgentActionLogDocument
  extends IMastraAgentActionLog, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
