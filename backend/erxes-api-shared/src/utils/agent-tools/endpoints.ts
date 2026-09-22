import {
  Application,
  Request as ApiRequest,
  Response as ApiResponse,
} from 'express';
import { IUserDocument } from '../../core-types';
import { checkPermissionGroup } from '../../core-modules/permissions/utils';
import { createPluginTRPCContext, err, ok, sendTRPCMessage } from '../trpc';
import { decodeAgentToolsAuthHeader } from './auth';
import { buildAgentToolManifest } from './manifest';
import {
  agentToolResponseTooLargeError,
  getAgentToolMaxResponseBytes,
  oversizedAgentToolResultBytes,
} from './responseLimit';
import {
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
  /** Prefixes of tRPC procedure paths to keep out of the manifest. */
  exclude?: string[];
}

const MANIFEST_TTL_MS = 60_000;

const manifestCache = new Map<
  string,
  { manifest: AgentToolManifest; at: number }
>();

/** Cache key scoped to the tenant and the full mount configuration. */
const manifestCacheKey = (
  subdomain: string,
  options: AgentToolsOptions,
): string => JSON.stringify([options.plugin, subdomain, options.exclude || []]);

const getManifest = async (
  subdomain: string,
  options: AgentToolsOptions,
): Promise<AgentToolManifest> => {
  const cacheKey = manifestCacheKey(subdomain, options);
  const cached = manifestCache.get(cacheKey);

  if (cached && Date.now() - cached.at < MANIFEST_TTL_MS) {
    return cached.manifest;
  }

  const manifest = buildAgentToolManifest({
    plugin: options.plugin,
    trpcRouter: options.trpcRouter,
    exclude: options.exclude || [],
  });

  manifestCache.set(cacheKey, { manifest, at: Date.now() });

  return manifest;
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
    throw new TypeError(`tRPC procedure '${descriptor.path}' not found`);
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

      const result = await executeTrpcTool(
        options,
        subdomain,
        userId,
        descriptor,
        input,
      );

      // Oversized payloads stall the agent run and freeze the chat UI; reject
      // them with guidance so the model retries with a narrower call.
      const maxResponseBytes = getAgentToolMaxResponseBytes();
      const resultBytes = oversizedAgentToolResultBytes(
        result,
        maxResponseBytes,
      );

      if (resultBytes !== null) {
        return res
          .status(413)
          .json(
            err(
              agentToolResponseTooLargeError(
                toolId,
                resultBytes,
                maxResponseBytes,
              ),
            ),
          );
      }

      return res.json(ok(result));
    } catch (error) {
      console.error('[agent-tools] call error:', error);

      return res
        .status(500)
        .json(err(new Error('Agent tool execution failed')));
    }
  });
};
