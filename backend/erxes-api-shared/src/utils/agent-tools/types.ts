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

export type AgentModelOperation =
  | 'find'
  | 'findOne'
  | 'count'
  | 'create'
  | 'update'
  | 'remove';

interface AgentToolBase {
  id: string; // e.g. 'sales.model.Deals.find' or 'sales.trpc.deal.findOne'
  plugin: string;
  module: string; // model name ('Deals') or first tRPC path segment ('deal')
  method: 'query' | 'mutation';
  destructive: boolean;
  description: string;
  inputFields: AgentToolField[] | null; // null = free-form object input
  permission: AgentToolPermission | null;
}

export type AgentModelToolDescriptor = AgentToolBase & {
  kind: 'model';
  modelName: string;
  modelFields: AgentToolField[]; // schema field summary for LLM guidance
  op: AgentModelOperation;
};

export type AgentTrpcToolDescriptor = AgentToolBase & {
  kind: 'trpc';
  path: string; // full procedure path e.g. 'deal.findOne'
};

export type AgentToolDescriptor =
  | AgentModelToolDescriptor
  | AgentTrpcToolDescriptor;

export interface AgentToolManifest {
  plugin: string;
  tools: AgentToolDescriptor[];
}

/** Minimal structural view of a Mongoose schema path used for tool fields. */
export interface AgentSchemaPath {
  instance?: string;
  isRequired?: boolean;
  enumValues?: string[];
}

/** Minimal structural view of a Mongoose query chain used by model tools. */
export interface AgentModelQuery {
  limit(value: number): AgentModelQuery;
  skip(value: number): AgentModelQuery;
  sort(sort: Record<string, 1 | -1>): AgentModelQuery;
  select(fields: string): AgentModelQuery;
  lean(): Promise<unknown>;
}

/**
 * Minimal structural view of a Mongoose model used by model tools. Plugin
 * models are external to this module, so the surface is declared explicitly
 * instead of relying on `any`; plugin statics are reachable through the index
 * signature and narrowed at the call site.
 */
export interface AgentMongooseModel {
  schema?: { paths?: Record<string, AgentSchemaPath> };
  find(query?: Record<string, unknown>): AgentModelQuery;
  findOne(query?: Record<string, unknown>): AgentModelQuery;
  countDocuments(query?: Record<string, unknown>): Promise<number>;
  create(doc: Record<string, unknown>): Promise<unknown>;
  findOneAndUpdate(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options: { new: boolean },
  ): AgentModelQuery;
  deleteOne(filter: Record<string, unknown>): Promise<unknown>;
  [key: string]: unknown;
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

/**
 * Per-model permission overrides mapping CRUD operation groups onto the
 * plugin's registered permission actions (e.g. core's Customers model maps to
 * the 'contacts*' actions).
 */
export type AgentModelPermissionMap = Record<
  string,
  Partial<Record<'read' | 'create' | 'update' | 'remove', string>>
>;
