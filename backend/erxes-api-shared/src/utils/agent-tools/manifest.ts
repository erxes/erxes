import {
  AgentMongooseModel,
  AgentProcedureMeta,
  AgentSchemaPath,
  AgentToolDescriptor,
  AgentToolField,
  AgentToolManifest,
  AgentToolPermission,
  AgentTrpcProcedure,
  AgentTrpcRouter,
  AgentModelOperation,
  AgentModelPermissionMap,
} from './types';

const MAX_MODEL_FIELDS = 40;
const DESCRIPTION_FIELD_HINTS = 20;

const lowerFirst = (value: string): string =>
  value.charAt(0).toLowerCase() + value.slice(1);

const inputField = (
  name: string,
  type: string,
  required: boolean,
): AgentToolField => ({ name, type, required });

// Mongoose models are plugin-defined and validated structurally at this
// boundary. Models are classes (typeof === 'function'), so both functions and
// objects qualify.
export const isMongooseModel = (
  model: unknown,
): model is AgentMongooseModel => {
  const candidate = model as AgentMongooseModel | null | undefined;

  return Boolean(
    candidate &&
      (typeof candidate === 'object' || typeof candidate === 'function') &&
      candidate.schema &&
      typeof candidate.find === 'function',
  );
};

/** Summarize a model's schema paths into tool-friendly field metadata. */
const extractModelFields = (model: AgentMongooseModel): AgentToolField[] => {
  const fields: AgentToolField[] = [];
  const paths: Record<string, AgentSchemaPath> = model.schema?.paths || {};

  for (const [name, pathInstance] of Object.entries(paths)) {
    if (name === '__v') {
      continue;
    }

    // Skip deep subdocument paths beyond one level of nesting
    if (name.split('.').length > 2) {
      continue;
    }

    if (fields.length >= MAX_MODEL_FIELDS) {
      break;
    }

    fields.push({
      name,
      type: pathInstance.instance || 'Mixed',
      required: Boolean(pathInstance.isRequired),
      enumValues: pathInstance.enumValues || undefined,
    });
  }

  return fields;
};

const describeFields = (fields: AgentToolField[]): string =>
  fields
    .slice(0, DESCRIPTION_FIELD_HINTS)
    .map((field) => `${field.name}: ${field.type}${field.required ? '!' : ''}`)
    .join(', ');

type ModelToolGroup = 'read' | 'create' | 'update' | 'remove';

const MODEL_OP_GROUPS: Record<AgentModelOperation, ModelToolGroup> = {
  find: 'read',
  findOne: 'read',
  count: 'read',
  create: 'create',
  update: 'update',
  remove: 'remove',
};

/**
 * Candidate registered-action names for one model operation group, covering
 * the permission naming conventions used across plugins (e.g. sales registers
 * `showDeals` / `dealsAdd` / `dealsEdit` / `dealsRemove`, core registers
 * `productsRead` / `productsCreate` / `productsUpdate` / `productsDelete`).
 */
const permissionCandidates = (
  modelName: string,
  group: ModelToolGroup,
): string[] => {
  const lowerModel = lowerFirst(modelName);

  switch (group) {
    case 'read':
      return [`show${modelName}`, `${lowerModel}Read`, `${lowerModel}Show`];
    case 'create':
      return [`${lowerModel}Add`, `${lowerModel}Create`];
    case 'update':
      return [`${lowerModel}Edit`, `${lowerModel}Update`];
    case 'remove':
      return [`${lowerModel}Remove`, `${lowerModel}Delete`];
  }
};

/**
 * Resolve a model operation group to the plugin's registered permission
 * action. An explicit `modelPermissions` override wins; otherwise the first
 * candidate registered by the plugin is used. Returns null when nothing
 * resolves — the caller must omit the tool instead of emitting an
 * unregistered permission.
 */
const resolveModelPermission = (
  modelName: string,
  group: ModelToolGroup,
  module: string,
  registeredActions: Set<string>,
  modelPermissions: AgentModelPermissionMap,
): AgentToolPermission | null => {
  const override = modelPermissions[modelName]?.[group];

  if (override) {
    return registeredActions.has(override)
      ? { module, action: override }
      : null;
  }

  for (const candidate of permissionCandidates(modelName, group)) {
    if (registeredActions.has(candidate)) {
      return { module, action: candidate };
    }
  }

  return null;
};

const MODEL_TOOL_DEFS: {
  op: AgentModelOperation;
  method: 'query' | 'mutation';
  destructive: boolean;
  verb: string;
  inputFields: AgentToolField[];
}[] = [
  {
    op: 'find',
    method: 'query',
    destructive: false,
    verb: 'Find documents',
    inputFields: [
      inputField('query', 'object', false),
      inputField('limit', 'number', false),
      inputField('skip', 'number', false),
      inputField('sort', 'object', false),
      inputField('select', 'string-array', false),
    ],
  },
  {
    op: 'findOne',
    method: 'query',
    destructive: false,
    verb: 'Find one document',
    inputFields: [
      inputField('query', 'object', true),
      inputField('select', 'string-array', false),
    ],
  },
  {
    op: 'count',
    method: 'query',
    destructive: false,
    verb: 'Count documents',
    inputFields: [inputField('query', 'object', false)],
  },
  {
    op: 'create',
    method: 'mutation',
    destructive: true,
    verb: 'Create a document',
    inputFields: [inputField('doc', 'object', true)],
  },
  {
    op: 'update',
    method: 'mutation',
    destructive: true,
    verb: 'Update a document',
    inputFields: [
      inputField('_id', 'string', true),
      inputField('doc', 'object', true),
    ],
  },
  {
    op: 'remove',
    method: 'mutation',
    destructive: true,
    verb: 'Remove a document',
    inputFields: [inputField('_id', 'string', true)],
  },
];

/** Build the CRUD tool set for one model, omitting operations whose
 * permission action is not registered by the plugin. */
const buildModelTools = (
  plugin: string,
  modelName: string,
  model: AgentMongooseModel,
  registeredActions: Set<string>,
  modelPermissions: AgentModelPermissionMap,
): AgentToolDescriptor[] => {
  const module = lowerFirst(modelName);
  const modelFields = extractModelFields(model);
  const fieldHints = describeFields(modelFields);

  const describe = (verb: string): string =>
    `${verb} in ${plugin} model ${modelName}.${
      fieldHints ? ` Fields: ${fieldHints}` : ''
    }`;

  const tools: AgentToolDescriptor[] = [];

  for (const def of MODEL_TOOL_DEFS) {
    const permission = resolveModelPermission(
      modelName,
      MODEL_OP_GROUPS[def.op],
      module,
      registeredActions,
      modelPermissions,
    );

    if (!permission) {
      continue;
    }

    tools.push({
      id: `${plugin}.model.${modelName}.${def.op}`,
      kind: 'model',
      plugin,
      module,
      modelName,
      modelFields,
      method: def.method,
      destructive: def.destructive,
      op: def.op,
      description: describe(def.verb),
      inputFields: def.inputFields,
      permission,
    });
  }

  return tools;
};

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
 * Derive the agent tool manifest for a plugin. Model tools are emitted only
 * for models on the explicit `includeModels` allow list whose operations
 * resolve to registered permission actions; tRPC tools only for procedures
 * declaring an agent permission.
 */
export const buildAgentToolManifest = (opts: {
  plugin: string;
  models: Record<string, unknown> | null;
  trpcRouter?: AgentTrpcRouter;
  exclude: string[];
  includeModels?: string[];
  modelPermissions?: AgentModelPermissionMap;
  registeredActions?: Set<string>;
}): AgentToolManifest => {
  const {
    plugin,
    models,
    trpcRouter,
    exclude,
    includeModels,
    modelPermissions = {},
    registeredActions = new Set<string>(),
  } = opts;
  const tools: AgentToolDescriptor[] = [];

  if (models && typeof models === 'object' && includeModels?.length) {
    for (const modelName of includeModels) {
      const model = models[modelName];

      if (!isMongooseModel(model)) {
        continue;
      }

      tools.push(
        ...buildModelTools(
          plugin,
          modelName,
          model,
          registeredActions,
          modelPermissions,
        ),
      );
    }
  }

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

  const isExcluded = (tool: AgentToolDescriptor): boolean =>
    exclude.some(
      (entry) =>
        tool.id.startsWith(entry) ||
        (tool.kind === 'trpc' ? tool.path.startsWith(entry) : false),
    );

  return { plugin, tools: tools.filter((tool) => !isExcluded(tool)) };
};
