export interface AgentToolField {
  name: string;
  type: string;
  required: boolean;
  enumValues?: string[];
}

export interface AgentToolPermission {
  module: string;
  action: string;
}

export interface AgentTrpcToolDescriptor {
  id: string; // e.g. 'sales.trpc.deal.findOne'
  kind: 'trpc';
  plugin: string;
  module: string; // first tRPC path segment ('deal')
  method: 'query' | 'mutation';
  destructive: boolean;
  description: string;
  inputFields: AgentToolField[] | null; // null = free-form object input
  permission: AgentToolPermission | null;
  path: string; // full procedure path e.g. 'deal.findOne'
}

export type AgentToolDescriptor = AgentTrpcToolDescriptor;

export interface AgentToolManifest {
  plugin: string;
  tools: AgentToolDescriptor[];
}

/** Optional per-procedure agent curation metadata. */
export interface AgentProcedureMeta {
  description?: string;
  permission?: AgentToolPermission;
}

/** Structural view of a tRPC v11 procedure used for tool derivation. */
export interface AgentTrpcProcedure {
  _def?: {
    type?: string;
    inputs?: unknown[];
    meta?: unknown;
  };
}

/** Structural view of a tRPC v11 router accepted from plugins. */
export interface AgentTrpcRouter {
  _def?: { procedures?: Record<string, unknown> };
  createCaller?: (context: unknown) => unknown;
}