import { createScopedEventHandlers } from '../../core-modules/common/eventHandlers/generateEventHandlers';
import {
  createTRPCUntypedClient,
  httpBatchLink,
  TRPCRequestOptions,
} from '@trpc/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import { IncomingHttpHeaders } from 'http';
import { getPlugin, isEnabled } from '../service-discovery';
import { generateRequestProcess, getEnv } from '../utils';
import { setEventHandlerRuntimeContext } from '../../core-modules/common/eventHandlers/runtimeContext';

export type MessageProps = {
  subdomain: string;
  method?: 'query' | 'mutation';
  pluginName: string;
  module: string;
  action: string;
  input: any;
  defaultValue?: any;
  options?: TRPCRequestOptions;
  context?: CommonTRPCContext;
};

export type CommonTRPCContext = {
  processId?: string;
  userId?: string;
  cpUserId?: string;
};

export type ScopedEventHandlers = ReturnType<typeof createScopedEventHandlers>;

type RequestTRPCContext = {
  subdomain: string;
} & CommonTRPCContext;

export type TRPCContext = RequestTRPCContext & {
  eventHandlers: ScopedEventHandlers;
};

export interface InterMessage {
  subdomain: string;
  data?: any;
  timeout?: number;
  defaultValue?: any;
  thirdService?: boolean;
}

export interface RPSuccess {
  status: 'success';
  data?: any;
}
export interface RPError {
  status: 'error';
  errorMessage: string;
}
export type RPResult = RPSuccess | RPError;
export type RP = (params: InterMessage) => RPResult | Promise<RPResult>;

export const trpcContextHeaderName = 'x-trpc-context';

export function encodeTRPCContextHeader(
  subdomain: string,
  method: 'query' | 'mutation',
  context: CommonTRPCContext | undefined,
): string {
  const contextData = {
    subdomain,
    method,
    ...context,
  };
  const contextJson = JSON.stringify(contextData);
  return Buffer.from(contextJson, 'utf8').toString('base64');
}

/**
 * Decode the base64 JSON tRPC context header into tenant, method, and caller
 * context. Returns null when the header is absent or malformed. Note: the
 * header is an encoding, not an authentication credential.
 */
export function decodeTRPCContextHeader(headers: IncomingHttpHeaders): {
  subdomain: string;
  method: 'query' | 'mutation';
  context: CommonTRPCContext;
} | null {
  const contextHeader = headers[trpcContextHeaderName];
  if (!contextHeader) {
    return null;
  }
  if (Array.isArray(contextHeader)) {
    throw new Error(`Multiple ${trpcContextHeaderName} headers`);
  }
  try {
    const contextJson = Buffer.from(contextHeader, 'base64').toString('utf-8');
    const decoded = JSON.parse(contextJson);
    const { subdomain, method, ...context } = decoded;
    return { subdomain, method, context };
  } catch (error) {
    return null;
  }
}

export const sendTRPCMessage = async ({
  subdomain,
  pluginName,
  method,
  module,
  action,
  input,
  defaultValue,
  options,
  context,
}: MessageProps) => {
  if (!method) {
    method = 'query';
  }

  if (pluginName && !(await isEnabled(pluginName))) {
    return defaultValue;
  }

  const pluginInfo = await getPlugin(pluginName);

  const VERSION = getEnv({ name: 'VERSION' });

  let client;

  try {
    // Encode context into header
    const contextHeader = encodeTRPCContextHeader(subdomain, method, context);

    if (VERSION && VERSION === 'saas') {
      client = createTRPCUntypedClient({
        links: [
          httpBatchLink({
            url: `https://${subdomain}.next.erxes.io/gateway/pl:${pluginName}/trpc`,
            headers: () => ({
              [trpcContextHeaderName]: contextHeader,
            }),
          }),
        ],
      });
    } else {
      // Validate plugin address before constructing URL
      if (!pluginInfo.address || pluginInfo.address.trim() === '') {
        console.warn(
          `Plugin "${pluginName}" address is not available. Returning defaultValue.`,
        );
        return defaultValue;
      }

      client = createTRPCUntypedClient({
        links: [
          httpBatchLink({
            url: `${pluginInfo.address}/trpc`,
            headers: () => ({
              [trpcContextHeaderName]: contextHeader,
            }),
          }),
        ],
      });
    }

    const result = await client[method](`${module}.${action}`, input, options);
    return result || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

/**
 * Shared plugin-context initialization for in-process tRPC execution:
 * request process state, event-handler runtime context, and scoped event
 * handlers. Used by the /trpc express adapter and by the agent-tools
 * endpoints so both paths build identical contexts.
 */
export const createPluginTRPCContext = async <TContext>(
  subdomain: string,
  reqContext: CommonTRPCContext,
  trpcContext?: (subdomain: string, context: any) => Promise<TContext>,
): Promise<TContext | TRPCContext> => {
  const processInfo = generateRequestProcess();

  const context: RequestTRPCContext = {
    ...processInfo,
    ...reqContext,
    subdomain,
  };

  const runtimeContext = {
    subdomain,
    processId: context.processId || '',
    userId: context.userId || '',
  };

  setEventHandlerRuntimeContext(subdomain, runtimeContext);

  const eventHandlers = createScopedEventHandlers(subdomain, runtimeContext);

  if (trpcContext) {
    return await trpcContext(subdomain, {
      ...context,
      eventHandlers,
    });
  }

  return {
    ...context,
    eventHandlers,
  };
};

export const createTRPCContext =
  <TContext>(
    trpcContext: (
      subdomain: string,
      context: any,
    ) => Promise<TContext & TRPCContext>,
  ) =>
  async ({
    req,
  }: trpcExpress.CreateExpressContextOptions): Promise<
    TContext & TRPCContext
  > => {
    // Extract context from header (encoded) or fallback to request body/input
    const decoded = decodeTRPCContextHeader(req.headers);
    const subdomain = decoded?.subdomain;
    const reqContext = decoded?.context;
    const method = decoded?.method || 'query';

    if (!subdomain || (method === 'mutation' && !reqContext)) {
      throw new Error('Invalid context');
    }

    return (await createPluginTRPCContext(
      subdomain,
      reqContext || {},
      trpcContext,
    )) as TContext & TRPCContext;
  };

export type ITRPCContext<TExtraContext = object> = Awaited<
  ReturnType<typeof createTRPCContext<TExtraContext>>
>;

export const ok = (data: any) => {
  return {
    status: 'success',
    data,
    timestamp: new Date().toISOString(),
  };
};

export const err = (error: any) => {
  return {
    status: 'error',
    error: {
      code: error.code || 'SERVER_ERROR',
      message: error.message || error.message,
      details: error instanceof Error ? error.message : 'Database error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error instanceof Error ? error.stack : undefined,
      }),
      ...(error.suggestion && { suggestion: error.suggestion }),
    },
    timestamp: new Date().toISOString(),
  };
};
