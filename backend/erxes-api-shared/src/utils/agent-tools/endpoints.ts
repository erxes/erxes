import {
  Application,
  Request as ApiRequest,
  Response as ApiResponse,
} from 'express';
import { IPermissionConfig, IUserDocument } from '../../core-types';
import { checkPermissionGroup } from '../../core-modules/permissions/utils';
import { getPlugin } from '../service-discovery';
import { createPluginTRPCContext, err, ok, sendTRPCMessage } from '../trpc';
import { decodeAgentToolsAuthHeader } from './auth';
import { buildAgentToolManifest, isMongooseModel } from './manifest';
import { capturePluginModels, getCapturedPluginModels } from './modelRegistry';
import {
  AgentModelPermissionMap,
  AgentModelToolDescriptor,
  AgentToolField,
  AgentToolManifest,
  AgentTrpcRouter,
  AgentTrpcToolDescriptor,
} from './types';

export interface AgentToolsOptions {
  plugin: string;
  // Router and context factory are plugin-defined; typed structurally at this
  // boundary since plugins construct them dynamically.
  trpcRouter?: AgentTrpcRouter;
  createContext?: (
    subdomain: string,
    context: Record<string, unknown>,
  ) => Promise<unknown>;
  exclude?: string[];
  /** Explicit allow list of model names exposed as CRUD tools. */
  includeModels?: string[];
  /** Per-model overrides mapping operations to registered permission actions. */
  modelPermissions?: AgentModelPermissionMap;
}

type ModelRecord = Record<string, unknown>;

const MANIFEST_TTL_MS = 60_000;

const manifestCache = new Map<
  string,
  { manifest: AgentToolManifest; at: number }
>();

/** Cache key scoped to the tenant and the full mount configuration. */
const manifestCacheKey = (
  subdomain: string,
  options: AgentToolsOptions,
): string =>
  JSON.stringify([
    options.plugin,
    subdomain,
    options.exclude || [],
    options.includeModels || [],
    Object.keys(options.modelPermissions || {}).sort(),
  ]);

/** Resolve tenant models from the capture registry or the context factory. */
const resolveModels = async (
  subdomain: string,
  createContext?: (
    subdomain: string,
    context: Record<string, unknown>,
  ) => Promise<unknown>,
): Promise<ModelRecord | null> => {
  const captured = getCapturedPluginModels(subdomain);

  if (captured) {
    return captured;
  }

  if (!createContext) {
    return null;
  }

  const context = await createContext(subdomain, { subdomain });

  if (context && typeof context === 'object' && 'models' in context) {
    const models = (context as { models?: unknown }).models;

    capturePluginModels(subdomain, models);

    if (models && typeof models === 'object') {
      return models as ModelRecord;
    }
  }

  return null;
};

/** Permission actions the plugin registered in its service config. */
const getRegisteredActions = async (plugin: string): Promise<Set<string>> => {
  const actions = new Set<string>();

  try {
    const service = await getPlugin(plugin);
    const permissions = (
      service?.config?.meta as { permissions?: IPermissionConfig } | undefined
    )?.permissions;

    for (const module of permissions?.modules || []) {
      for (const action of module?.actions || []) {
        if (action?.name) {
          actions.add(action.name);
        }
      }
    }
  } catch {
    // Registry unavailable — fail closed: no model tools resolve.
  }

  return actions;
};

// NOTE: models resolve per subdomain, but the derived tool ids are stable
// across subdomains, so the manifest is safe to cache per subdomain + config.
const getManifest = async (
  subdomain: string,
  options: AgentToolsOptions,
): Promise<AgentToolManifest> => {
  const cacheKey = manifestCacheKey(subdomain, options);
  const cached = manifestCache.get(cacheKey);

  if (cached && Date.now() - cached.at < MANIFEST_TTL_MS) {
    return cached.manifest;
  }

  let models: ModelRecord | null = null;

  try {
    models = await resolveModels(subdomain, options.createContext);
  } catch {
    // Model resolution is best-effort; the manifest still carries tRPC tools.
    models = null;
  }

  const registeredActions = await getRegisteredActions(options.plugin);

  const manifest = buildAgentToolManifest({
    plugin: options.plugin,
    models,
    trpcRouter: options.trpcRouter,
    exclude: options.exclude || [],
    includeModels: options.includeModels,
    modelPermissions: options.modelPermissions,
    registeredActions,
  });

  manifestCache.set(cacheKey, { manifest, at: Date.now() });

  return manifest;
};

/** Input validation failure — surfaced to the caller as HTTP 400. */
class AgentToolInputError extends Error {}

// Query operators allowed in model tool `query` input. `$where` and any
// operator outside this list are rejected so callers cannot smuggle server-
// side JavaScript or unexpected aggregation behavior into MongoDB.
const ALLOWED_QUERY_OPERATORS = new Set([
  '$eq',
  '$ne',
  '$gt',
  '$gte',
  '$lt',
  '$lte',
  '$in',
  '$nin',
  '$exists',
  '$regex',
  '$options',
  '$and',
  '$or',
  '$nor',
  '$not',
  '$elemMatch',
  '$all',
  '$size',
]);

const assertSafeQueryValue = (value: unknown): void => {
  if (Array.isArray(value)) {
    for (const item of value) {
      assertSafeQueryValue(item);
    }
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if (key.startsWith('$') && !ALLOWED_QUERY_OPERATORS.has(key)) {
        throw new AgentToolInputError(`Query operator '${key}' is not allowed`);
      }
      assertSafeQueryValue(nested);
    }
    return;
  }

  if (typeof value === 'function') {
    throw new AgentToolInputError('Functions are not allowed in query input');
  }
};

const assertSafeDocValue = (value: unknown): void => {
  if (Array.isArray(value)) {
    for (const item of value) {
      assertSafeDocValue(item);
    }
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if (key.startsWith('$')) {
        throw new AgentToolInputError(
          'Update operators are not allowed in doc input',
        );
      }
      assertSafeDocValue(nested);
    }
    return;
  }

  if (typeof value === 'function') {
    throw new AgentToolInputError('Functions are not allowed in doc input');
  }
};

const sanitizeQuery = (input: unknown): Record<string, unknown> => {
  if (input === undefined || input === null) {
    return {};
  }

  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new AgentToolInputError('query must be an object');
  }

  assertSafeQueryValue(input);

  return input as Record<string, unknown>;
};

const sanitizeDoc = (input: unknown): Record<string, unknown> => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AgentToolInputError('doc must be a non-empty object');
  }

  assertSafeDocValue(input);

  return input as Record<string, unknown>;
};

const sanitizeId = (input: unknown): string => {
  if (typeof input !== 'string' || !input) {
    throw new AgentToolInputError('_id must be a non-empty string');
  }

  return input;
};

const sanitizeSelect = (
  input: unknown,
  modelFields: AgentToolField[],
): string[] | undefined => {
  if (input === undefined || input === null) {
    return undefined;
  }

  if (!Array.isArray(input)) {
    throw new AgentToolInputError('select must be an array of field names');
  }

  const allowed = new Set(modelFields.map((field) => field.name));
  const select: string[] = [];

  for (const entry of input) {
    if (typeof entry !== 'string' || !allowed.has(entry)) {
      throw new AgentToolInputError(
        `select field '${String(entry)}' is not a model field`,
      );
    }
    select.push(entry);
  }

  return select;
};

const sanitizeSort = (
  input: unknown,
  modelFields: AgentToolField[],
): Record<string, 1 | -1> | undefined => {
  if (input === undefined || input === null) {
    return undefined;
  }

  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new AgentToolInputError('sort must be an object');
  }

  const allowed = new Set(modelFields.map((field) => field.name));
  const sort: Record<string, 1 | -1> = {};

  for (const [key, direction] of Object.entries(
    input as Record<string, unknown>,
  )) {
    if (!allowed.has(key)) {
      throw new AgentToolInputError(`sort field '${key}' is not a model field`);
    }

    if (![1, -1, 'asc', 'desc'].includes(direction as string | number)) {
      throw new AgentToolInputError(
        `sort direction for '${key}' must be 1, -1, 'asc', or 'desc'`,
      );
    }

    sort[key] = direction === -1 || direction === 'desc' ? -1 : 1;
  }

  return sort;
};

const sanitizeSkip = (input: unknown): number => {
  const skip = Number(input) || 0;

  if (!Number.isFinite(skip) || skip < 0) {
    throw new AgentToolInputError('skip must be a non-negative number');
  }

  return Math.floor(skip);
};

/** Execute a model CRUD tool against validated, schema-scoped input. */
const executeModelTool = async (
  models: ModelRecord,
  descriptor: AgentModelToolDescriptor,
  input: Record<string, unknown> | undefined,
): Promise<unknown> => {
  const model = models[descriptor.modelName];

  if (!isMongooseModel(model)) {
    throw new Error(`Model '${descriptor.modelName}' is not available`);
  }

  // Plugin models conventionally expose statics named after the singular
  // model name (e.g. Deals -> createDeal/updateDeal/removeDeal); prefer them
  // so plugin business logic runs, falling back to raw Mongoose calls.
  const singular = descriptor.modelName.endsWith('s')
    ? descriptor.modelName.slice(0, -1)
    : descriptor.modelName;

  const callStatic = (
    staticName: string,
    args: unknown[],
  ): Promise<unknown> | null => {
    const staticFn = model[staticName];

    if (typeof staticFn !== 'function') {
      return null;
    }

    return Promise.resolve(
      (staticFn as (...staticArgs: unknown[]) => unknown).apply(model, args),
    );
  };

  switch (descriptor.op) {
    case 'find': {
      let query = model.find(sanitizeQuery(input?.query));

      query = query.limit(Math.min(Number(input?.limit) || 50, 100));

      const skip = sanitizeSkip(input?.skip);

      if (skip > 0) {
        query = query.skip(skip);
      }

      const sort = sanitizeSort(input?.sort, descriptor.modelFields);

      if (sort) {
        query = query.sort(sort);
      }

      const select = sanitizeSelect(input?.select, descriptor.modelFields);

      if (select?.length) {
        query = query.select(select.join(' '));
      }

      return await query.lean();
    }
    case 'findOne': {
      let query = model.findOne(sanitizeQuery(input?.query));

      const select = sanitizeSelect(input?.select, descriptor.modelFields);

      if (select?.length) {
        query = query.select(select.join(' '));
      }

      return await query.lean();
    }
    case 'count':
      return await model.countDocuments(sanitizeQuery(input?.query));
    case 'create': {
      const doc = sanitizeDoc(input?.doc);
      const staticResult = await callStatic(`create${singular}`, [doc]);

      if (staticResult !== null) {
        return staticResult;
      }

      return await model.create(doc);
    }
    case 'update': {
      const id = sanitizeId(input?._id);
      const doc = sanitizeDoc(input?.doc);
      const staticResult = await callStatic(`update${singular}`, [id, doc]);

      if (staticResult !== null) {
        return staticResult;
      }

      return await model
        .findOneAndUpdate({ _id: id }, { $set: doc }, { new: true })
        .lean();
    }
    case 'remove': {
      const id = sanitizeId(input?._id);
      const staticResult = await callStatic(`remove${singular}`, [id]);

      if (staticResult !== null) {
        return staticResult;
      }

      return await model.deleteOne({ _id: id });
    }
    default:
      throw new Error(`Unsupported model operation '${descriptor.op}'`);
  }
};

/** Execute a tRPC tool in-process through the plugin's context factory. */
const executeTrpcTool = async (
  options: AgentToolsOptions,
  subdomain: string,
  userId: string,
  descriptor: AgentTrpcToolDescriptor,
  input: Record<string, unknown> | undefined,
): Promise<unknown> => {
  const { trpcRouter, createContext } = options;

  if (!trpcRouter || typeof trpcRouter.createCaller !== 'function') {
    throw new Error('tRPC router is not available on this plugin');
  }

  // `__processId` is a reserved key used only for context propagation; the
  // remaining input object is the procedure input itself.
  const { __processId, ...procedureInput } = input || {};

  // Reuse the shared /trpc context initialization so request process state
  // and event handlers behave identically to the public tRPC mount.
  const pluginContext = await createPluginTRPCContext(
    subdomain,
    {
      userId,
      processId: typeof __processId === 'string' ? __processId : undefined,
    },
    createContext,
  );

  const caller = trpcRouter.createCaller(pluginContext);

  // tRPC caller proxies are function-valued at every level, so the navigation
  // must accept functions as well as plain objects.
  const procedure = descriptor.path
    .split('.')
    .reduce<unknown>(
      (acc, segment) =>
        acc && (typeof acc === 'object' || typeof acc === 'function')
          ? (acc as Record<string, unknown>)[segment]
          : undefined,
      caller,
    );

  if (typeof procedure !== 'function') {
    throw new Error(`tRPC procedure '${descriptor.path}' not found`);
  }

  return await (procedure as (input: unknown) => Promise<unknown>)(
    input ? procedureInput : undefined,
  );
};

/**
 * Mount the agent capability endpoints on a service. Both endpoints require
 * the HMAC-signed agent auth header; identity is derived from the signed
 * payload, never from caller-controlled plain headers.
 */
export const mountAgentTools = (
  app: Application,
  options: AgentToolsOptions,
): void => {
  app.get(
    '/agent-tools/manifest',
    async (req: ApiRequest, res: ApiResponse) => {
      const auth = decodeAgentToolsAuthHeader(req.headers);

      if (!auth?.subdomain) {
        return res
          .status(401)
          .json(err(new Error('Missing or invalid agent auth header')));
      }

      try {
        const manifest = await getManifest(auth.subdomain, options);

        return res.json(ok(manifest));
      } catch (error) {
        console.error('[agent-tools] manifest error:', error);

        return res
          .status(500)
          .json(err(new Error('Failed to build agent tool manifest')));
      }
    },
  );

  app.post('/agent-tools/call', async (req: ApiRequest, res: ApiResponse) => {
    const auth = decodeAgentToolsAuthHeader(req.headers);
    const subdomain = auth?.subdomain;
    const userId = auth?.userId;

    if (!subdomain || !userId) {
      return res
        .status(401)
        .json(err(new Error('Missing or invalid agent auth header')));
    }

    const { toolId, input } = (req.body || {}) as {
      toolId?: string;
      input?: Record<string, unknown>;
    };

    if (!toolId || typeof toolId !== 'string') {
      return res
        .status(400)
        .json(err(new Error('Missing toolId in request body')));
    }

    if (
      input !== undefined &&
      (typeof input !== 'object' || input === null || Array.isArray(input))
    ) {
      return res
        .status(400)
        .json(err(new Error('input must be an object when provided')));
    }

    try {
      const manifest = await getManifest(subdomain, options);
      const descriptor = manifest.tools.find((tool) => tool.id === toolId);

      if (!descriptor) {
        return res
          .status(404)
          .json(err(new Error(`Unknown agent tool '${toolId}'`)));
      }

      // Fail closed: a tool without a declared permission is never callable.
      if (!descriptor.permission) {
        return res
          .status(403)
          .json(
            err(
              new Error(
                `Agent tool '${toolId}' declares no permission and is not callable`,
              ),
            ),
          );
      }

      const user = (await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        method: 'query',
        input: { query: { _id: userId } },
        defaultValue: null,
      })) as IUserDocument | null;

      if (!user) {
        return res
          .status(403)
          .json(err(new Error('Forbidden: user not found')));
      }

      try {
        await checkPermissionGroup(
          subdomain,
          user,
        )(descriptor.permission.action);
      } catch (permissionError) {
        return res.status(403).json(err(permissionError));
      }

      let result: unknown;

      if (descriptor.kind === 'model') {
        const models = await resolveModels(subdomain, options.createContext);

        if (!models) {
          return res
            .status(500)
            .json(err(new Error('Plugin models are not available')));
        }

        result = await executeModelTool(models, descriptor, input);
      } else {
        result = await executeTrpcTool(
          options,
          subdomain,
          userId,
          descriptor,
          input,
        );
      }

      return res.json(ok(result));
    } catch (error) {
      if (error instanceof AgentToolInputError) {
        return res.status(400).json(err(error));
      }

      console.error('[agent-tools] call error:', error);

      return res
        .status(500)
        .json(err(new Error('Agent tool execution failed')));
    }
  });
};
