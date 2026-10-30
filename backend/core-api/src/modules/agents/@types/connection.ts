import { Document } from 'mongoose';
import type { IAiAgentConnection } from 'erxes-api-shared/core-modules';

/**
 * One bring-your-own-key provider connection. The shape reuses the
 * platform's AI agent connection verbatim so the provider resolution in
 * `providers.ts` consumes it without adaptation.
 */
export type IAgentsConnectionEntry = IAiAgentConnection;

export const AGENTS_CONNECTION_SCOPES = ['private', 'organization'] as const;

export type AgentsConnectionScope = (typeof AGENTS_CONNECTION_SCOPES)[number];

export const AGENTS_ORGANIZATION_OWNER_ID = '__organization__';

export type IAgentsScopedConnectionEntry = IAgentsConnectionEntry & {
  scope: AgentsConnectionScope;
};

export interface IAgentsEffectiveConnections {
  connections: IAgentsScopedConnectionEntry[];
  defaultProvider?: string;
}

/**
 * One user's BYOK connections: an entry per configured provider, so the chat
 * can switch between providers/models without re-entering keys.
 */
export interface IAgentsConnections {
  userId: string;
  connections: IAgentsConnectionEntry[];
  /**
   * Provider the user chose as the server default. Optional and never
   * migrated: unset or no longer connected means the first entry applies.
   */
  defaultProvider?: string;
}

export interface IAgentsConnectionsDocument
  extends IAgentsConnections,
    Document {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
