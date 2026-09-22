import {
  AgentProcedureMeta,
  AgentToolDescriptor,
  AgentToolField,
  AgentToolManifest,
  AgentTrpcProcedure,
  AgentTrpcRouter,
} from './types';

// Zod internals are accessed structurally to stay agnostic to the plugin's
// zod instance. Zod 3 exposes `_def.typeName` ('ZodObject') and `.shape`;
// Zod 4 exposes `_zod.def.type` ('object') and `_zod.def.shape`.
interface ZodLikeSchema {
  _def?: { typeName?: string; type?: string; shape?: unknown };
  _zod?: { def?: { type?: string; shape?: unknown } };
  shape?: Record<string, ZodLikeSchema>;
  isOptional?: () => boolean;
}

const zodTypeName = (schema: ZodLikeSchema): string | undefined =>
  schema._def?.typeName || schema._def?.type || schema._zod?.def?.type;

const isZodObject = (schema: ZodLikeSchema): boolean => {
  const typeName = zodTypeName(schema);

  return typeName === 'ZodObject' || typeName === 'object';
};

const zodShape = (schema: ZodLikeSchema): Record<string, ZodLikeSchema> => {
  if (schema.shape && typeof schema.shape === 'object') {
    return schema.shape;
  }

  const defShape = schema._def?.shape ?? schema._zod?.def?.shape;

  if (defShape && typeof defShape === 'object') {
    return defShape as Record<string, ZodLikeSchema>;
  }

  return {};
};

/** A field is required unless wrapped in an optional/default schema. */
const isZodRequired = (schema: ZodLikeSchema): boolean => {
  if (typeof schema.isOptional === 'function') {
    return !schema.isOptional();
  }

  const typeName = zodTypeName(schema);

  return typeName !== 'optional' && typeName !== 'default';
};

/** Extract flat input fields when a procedure's input parser is a Zod object. */
const extractTrpcInputFields = (
  proc: AgentTrpcProcedure,
): AgentToolField[] | null => {
  const inputSchema = proc?._def?.inputs?.[0] as ZodLikeSchema | undefined;

  if (!inputSchema || typeof inputSchema !== 'object') {
    return null;
  }

  if (!isZodObject(inputSchema)) {
    return null; // free-form object input
  }

  return Object.entries(zodShape(inputSchema)).map(([name, schema]) => ({
    name,
    type: zodTypeName(schema) || 'ZodUnknown',
    required: isZodRequired(schema),
  }));
};

/**
 * Build the tool descriptor for one tRPC procedure, or null when the
 * procedure declares no agent permission — tRPC tools are admit-only via
 * `.meta({ agent: { permission } })` so nothing is callable by default.
 */
const buildTrpcTool = (
  plugin: string,
  path: string,
  proc: AgentTrpcProcedure,
): AgentToolDescriptor | null => {
  // tRPC v11 router internals: `_def.procedures` is a flat path -> procedure
  // record; procedure type lives at `_def.type`.
  const procDef = proc?._def;
  const method: 'query' | 'mutation' =
    procDef?.type === 'mutation' ? 'mutation' : 'query';

  // Required curation hook: procedures opt in as agent tools via
  // `.meta({ agent: { description, permission } })`.
  const agentMeta = (
    procDef?.meta as { agent?: AgentProcedureMeta } | undefined
  )?.agent;

  if (!agentMeta?.permission?.action) {
    return null;
  }

  return {
    id: `${plugin}.trpc.${path}`,
    kind: 'trpc',
    plugin,
    module: path.split('.')[0],
    method,
    destructive: method === 'mutation',
    description:
      agentMeta.description || `Call ${plugin} tRPC procedure ${path}`,
    inputFields: extractTrpcInputFields(proc),
    permission: agentMeta.permission,
    path,
  };
};

/**
 * Derive the agent tool manifest for a plugin. tRPC tools are emitted only
 * for procedures declaring an agent permission; nothing else is exposed.
 */
export const buildAgentToolManifest = (opts: {
  plugin: string;
  trpcRouter?: AgentTrpcRouter;
  exclude: string[];
}): AgentToolManifest => {
  const { plugin, trpcRouter, exclude } = opts;
  const tools: AgentToolDescriptor[] = [];

  const procedures: Record<string, unknown> =
    trpcRouter?._def?.procedures || {};

  for (const [path, rawProc] of Object.entries(procedures)) {
    // tRPC internals are external to this module; entries are narrowed
    // structurally and anything without agent metadata is dropped below.
    const proc = rawProc as AgentTrpcProcedure;

    if (proc?._def?.type === 'subscription') {
      continue;
    }

    const tool = buildTrpcTool(plugin, path, proc);

    if (tool) {
      tools.push(tool);
    }
  }

  /** Match a tool against the configured exclude prefixes. */
  const isExcluded = (tool: AgentToolDescriptor): boolean =>
    exclude.some((entry) => tool.path.startsWith(entry));

  return { plugin, tools: tools.filter((tool) => !isExcluded(tool)) };
};