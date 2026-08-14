import {
  AgentToolDescriptor,
  AgentToolField,
  AgentToolManifest,
  AgentToolPermission,
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

// Mongoose models are plugin-defined and accessed structurally at this
// boundary, hence the pragmatic `any` casts on schema internals. Models are
// classes (typeof === 'function'), so both functions and objects qualify.
const isMongooseModel = (model: unknown): model is Record<string, any> => {
  const candidate = model as Record<string, any> | null | undefined;

  return Boolean(
    candidate &&
    (typeof candidate === 'object' || typeof candidate === 'function') &&
    candidate.schema &&
    typeof candidate.find === 'function',
  );
};

const extractModelFields = (model: Record<string, any>): AgentToolField[] => {
  const fields: AgentToolField[] = [];
  const paths = (model.schema?.paths || {}) as Record<string, any>;

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

const buildModelTools = (
  plugin: string,
  modelName: string,
  model: Record<string, any>,
): AgentToolDescriptor[] => {
  const module = lowerFirst(modelName);
  const modelFields = extractModelFields(model);
  const fieldHints = describeFields(modelFields);

  const describe = (verb: string): string =>
    `${verb} in ${plugin} model ${modelName}.${
      fieldHints ? ` Fields: ${fieldHints}` : ''
    }`;

  const permission = (action: string): AgentToolPermission => ({
    module,
    action: `${module}${action}`,
  });

  const base = {
    kind: 'model' as const,
    plugin,
    module,
    modelName,
    modelFields,
  };

  return [
    {
      ...base,
      id: `${plugin}.model.${modelName}.find`,
      method: 'query',
      destructive: false,
      op: 'find',
      description: describe('Find documents'),
      inputFields: [
        inputField('query', 'object', false),
        inputField('limit', 'number', false),
        inputField('skip', 'number', false),
        inputField('sort', 'object', false),
        inputField('select', 'string-array', false),
      ],
      permission: permission('Show'),
    },
    {
      ...base,
      id: `${plugin}.model.${modelName}.findOne`,
      method: 'query',
      destructive: false,
      op: 'findOne',
      description: describe('Find one document'),
      inputFields: [
        inputField('query', 'object', true),
        inputField('select', 'string-array', false),
      ],
      permission: permission('Show'),
    },
    {
      ...base,
      id: `${plugin}.model.${modelName}.count`,
      method: 'query',
      destructive: false,
      op: 'count',
      description: describe('Count documents'),
      inputFields: [inputField('query', 'object', false)],
      permission: permission('Show'),
    },
    {
      ...base,
      id: `${plugin}.model.${modelName}.create`,
      method: 'mutation',
      destructive: true,
      op: 'create',
      description: describe('Create a document'),
      inputFields: [inputField('doc', 'object', true)],
      permission: permission('Create'),
    },
    {
      ...base,
      id: `${plugin}.model.${modelName}.update`,
      method: 'mutation',
      destructive: true,
      op: 'update',
      description: describe('Update a document'),
      inputFields: [
        inputField('_id', 'string', true),
        inputField('doc', 'object', true),
      ],
      permission: permission('Update'),
    },
    {
      ...base,
      id: `${plugin}.model.${modelName}.remove`,
      method: 'mutation',
      destructive: true,
      op: 'remove',
      description: describe('Remove a document'),
      inputFields: [inputField('_id', 'string', true)],
      permission: permission('Remove'),
    },
  ];
};

// Zod schema internals (`_def.typeName`, `.shape`) are accessed structurally;
// zod is not imported here to stay agnostic to the plugin's zod instance.
const extractTrpcInputFields = (proc: any): AgentToolField[] | null => {
  const inputSchema = proc?._def?.inputs?.[0];

  if (!inputSchema || inputSchema?._def?.typeName !== 'ZodObject') {
    return null; // free-form object input
  }

  const shape = (inputSchema as { shape?: Record<string, any> }).shape || {};

  return Object.entries(shape).map(([name, schema]) => ({
    name,
    type: schema?._def?.typeName || 'ZodUnknown',
    required:
      typeof schema?.isOptional === 'function' ? !schema.isOptional() : true,
  }));
};

interface AgentProcedureMeta {
  description?: string;
  permission?: AgentToolPermission;
}

const buildTrpcTool = (
  plugin: string,
  path: string,
  proc: any,
): AgentToolDescriptor => {
  // tRPC v11 router internals: `_def.procedures` is a flat path -> procedure
  // record; procedure type lives at `_def.type`.
  const procDef = proc?._def || {};
  const method: 'query' | 'mutation' =
    procDef.type === 'mutation' ? 'mutation' : 'query';

  // Optional curation hook: procedures may carry agent-specific metadata via
  // `.meta({ agent: { description, permission } })`.
  const agentMeta = (procDef.meta as { agent?: AgentProcedureMeta } | undefined)
    ?.agent;

  return {
    id: `${plugin}.trpc.${path}`,
    kind: 'trpc',
    plugin,
    module: path.split('.')[0],
    method,
    destructive: method === 'mutation',
    description:
      agentMeta?.description || `Call ${plugin} tRPC procedure ${path}`,
    inputFields: extractTrpcInputFields(proc),
    permission: agentMeta?.permission || null,
    path,
  };
};

export const buildAgentToolManifest = (opts: {
  plugin: string;
  models: Record<string, any> | null;
  trpcRouter: any;
  exclude: string[];
}): AgentToolManifest => {
  const { plugin, models, trpcRouter, exclude } = opts;
  const tools: AgentToolDescriptor[] = [];

  if (models && typeof models === 'object') {
    for (const [modelName, model] of Object.entries(models)) {
      if (!isMongooseModel(model)) {
        continue;
      }

      tools.push(...buildModelTools(plugin, modelName, model));
    }
  }

  const procedures = (trpcRouter?._def?.procedures || {}) as Record<
    string,
    any
  >;

  for (const [path, proc] of Object.entries(procedures)) {
    if (proc?._def?.type === 'subscription') {
      continue;
    }

    tools.push(buildTrpcTool(plugin, path, proc));
  }

  const isExcluded = (tool: AgentToolDescriptor): boolean =>
    exclude.some(
      (entry) =>
        tool.id.startsWith(entry) ||
        (tool.path ? tool.path.startsWith(entry) : false),
    );

  return { plugin, tools: tools.filter((tool) => !isExcluded(tool)) };
};
