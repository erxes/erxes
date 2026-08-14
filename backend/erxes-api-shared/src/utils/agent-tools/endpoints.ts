import {
  Application,
  Request as ApiRequest,
  Response as ApiResponse,
} from 'express';
import { checkPermissionGroup } from '../../core-modules/permissions/utils';
import { decodeTRPCContextHeader, err, ok, sendTRPCMessage } from '../trpc';
import { buildAgentToolManifest } from './manifest';
import { capturePluginModels, getCapturedPluginModels } from './modelRegistry';
import { AgentToolDescriptor, AgentToolManifest } from './types';

export interface AgentToolsOptions {
  plugin: string;
  // Router and context factory are plugin-defined; typed loosely at this
  // boundary since plugins construct them dynamically.
  trpcRouter?: any;
  createContext?: (subdomain: string, context: any) => Promise<any>;
  exclude?: string[];
}

type ModelRecord = Record<string, any>;

const MANIFEST_TTL_MS = 60_000;

const manifestCache = new Map<
  string,
  { manifest: AgentToolManifest; at: number }
>();

const resolveModels = async (
  subdomain: string,
  createContext?: (subdomain: string, context: any) => Promise<any>,
): Promise<ModelRecord | null> => {
  const captured = getCapturedPluginModels(subdomain);

  if (captured) {
    return captured as ModelRecord;
  }

  if (!createContext) {
    return null;
  }

  const context = await createContext(subdomain, { subdomain });

  if (context && typeof context === 'object' && 'models' in context) {
    capturePluginModels(subdomain, context.models);

    return context.models as ModelRecord;
  }

  return null;
};

// NOTE: models resolve per subdomain, but the derived tool ids are stable
// across subdomains, so the manifest is safe to cache per subdomain.
const getManifest = async (
  subdomain: string,
  options: AgentToolsOptions,
): Promise<AgentToolManifest> => {
  const cached = manifestCache.get(subdomain);

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

  const manifest = buildAgentToolManifest({
    plugin: options.plugin,
    models,
    trpcRouter: options.trpcRouter,
    exclude: options.exclude || [],
  });

  manifestCache.set(subdomain, { manifest, at: Date.now() });

  return manifest;
};

const executeModelTool = async (
  models: ModelRecord,
  descriptor: AgentToolDescriptor,
  input: Record<string, any> | undefined,
): Promise<unknown> => {
  const modelName = descriptor.modelName as string;
  const model = models[modelName];

  if (!model) {
    throw new Error(`Model '${modelName}' is not available`);
  }

  // Plugin models conventionally expose statics named after the singular
  // model name (e.g. Deals -> createDeal/updateDeal/removeDeal); prefer them
  // so plugin business logic runs, falling back to raw Mongoose calls.
  const singular = modelName.endsWith('s') ? modelName.slice(0, -1) : modelName;

  switch (descriptor.op) {
    case 'find': {
      let query = model.find(input?.query || {});

      query = query.limit(Math.min(Number(input?.limit) || 50, 100));

      if (input?.skip) {
        query = query.skip(Number(input.skip));
      }

      if (input?.sort) {
        query = query.sort(input.sort);
      }

      if (Array.isArray(input?.select)) {
        query = query.select(input.select.join(' '));
      }

      return query.lean();
    }
    case 'findOne': {
      let query = model.findOne(input?.query || {});

      if (Array.isArray(input?.select)) {
        query = query.select(input.select.join(' '));
      }

      return query.lean();
    }
    case 'count':
      return model.countDocuments(input?.query || {});
    case 'create': {
      const staticName = `create${singular}`;

      if (typeof model[staticName] === 'function') {
        return model[staticName](input?.doc);
      }

      return model.create(input?.doc);
    }
    case 'update': {
      const staticName = `update${singular}`;

      if (typeof model[staticName] === 'function') {
        return model[staticName](input?._id, input?.doc);
      }

      return model
        .findOneAndUpdate(
          { _id: input?._id },
          { $set: input?.doc },
          { new: true },
        )
        .lean();
    }
    case 'remove': {
      const staticName = `remove${singular}`;

      if (typeof model[staticName] === 'function') {
        return model[staticName](input?._id);
      }

      return model.deleteOne({ _id: input?._id });
    }
    default:
      throw new Error(`Unsupported model operation '${descriptor.op}'`);
  }
};

const executeTrpcTool = async (
  options: AgentToolsOptions,
  subdomain: string,
  userId: string,
  descriptor: AgentToolDescriptor,
  input: Record<string, any> | undefined,
): Promise<unknown> => {
  const { trpcRouter, createContext } = options;

  if (!trpcRouter || !createContext) {
    throw new Error('tRPC router is not available on this plugin');
  }

  // `__processId` is a reserved key used only for context propagation; the
  // remaining input object is the procedure input itself.
  const { __processId, ...procedureInput } = input || {};

  const pluginContext = await createContext(subdomain, {
    subdomain,
    userId,
    processId: __processId,
  });

  const caller = trpcRouter.createCaller(pluginContext);

  // tRPC caller proxies are function-valued at every level, so the navigation
  // must accept functions as well as plain objects.
  const procedure = (descriptor.path as string)
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

  return (procedure as (procedureInput: unknown) => unknown)(
    input ? procedureInput : undefined,
  );
};

export const mountAgentTools = (
  app: Application,
  options: AgentToolsOptions,
): void => {
  app.get(
    '/agent-tools/manifest',
    async (req: ApiRequest, res: ApiResponse) => {
      const decoded = decodeTRPCContextHeader(req.headers);

      if (!decoded?.subdomain) {
        return res
          .status(401)
          .json(err(new Error('Missing or invalid x-trpc-context header')));
      }

      try {
        const manifest = await getManifest(decoded.subdomain, options);

        return res.json(ok(manifest));
      } catch (error) {
        return res.json(err(error));
      }
    },
  );

  app.post('/agent-tools/call', async (req: ApiRequest, res: ApiResponse) => {
    const decoded = decodeTRPCContextHeader(req.headers);
    const subdomain = decoded?.subdomain;
    const userId = decoded?.context?.userId;

    if (!subdomain || !userId) {
      return res
        .status(401)
        .json(err(new Error('Missing or invalid x-trpc-context header')));
    }

    const { toolId, input } = (req.body || {}) as {
      toolId?: string;
      input?: Record<string, any>;
    };

    if (!toolId) {
      return res
        .status(400)
        .json(err(new Error('Missing toolId in request body')));
    }

    try {
      const manifest = await getManifest(subdomain, options);
      const descriptor = manifest.tools.find((tool) => tool.id === toolId);

      if (!descriptor) {
        return res
          .status(404)
          .json(err(new Error(`Unknown agent tool '${toolId}'`)));
      }

      // tRPC-derived tools carry no derived permission; the channel is no
      // less trusted than the existing /trpc mount, so they are allowed.
      if (descriptor.permission) {
        const user = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'users',
          action: 'findOne',
          method: 'query',
          input: { query: { _id: userId } },
          defaultValue: null,
        });

        if (!user) {
          return res
            .status(403)
            .json(err(new Error('Forbidden: user not found')));
        }

        try {
          await checkPermissionGroup(subdomain, user)(
            descriptor.permission.action,
          );
        } catch (permissionError) {
          return res.status(403).json(err(permissionError));
        }
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
      return res.json(err(error));
    }
  });
};
