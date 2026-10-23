import { Document } from 'mongoose';
import type { IAiAgentConnection } from 'erxes-api-shared/core-modules';

/**
 * One bring-your-own-key provider connection. The shape reuses the
 * platform's AI agent connection verbatim so the provider resolution in
 * `providers.ts` consumes it without adaptation.
 */
export type IAgentsConnectionEntry = IAiAgentConnection;

/**
 * One user's BYOK connections: an entry per configured provider, so the chat
 * can switch between providers/models without re-entering keys.
 */
export interface IAgentsConnections {
  userId: string;
  connections: IAgentsConnectionEntry[];
}

export interface IAgentsConnectionsDocument
  extends IAgentsConnections,
    Document {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
