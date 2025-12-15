import {
  createTRPCUntypedClient,
  httpBatchLink,
  TRPCRequestOptions,
} from '@trpc/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import { IncomingHttpHeaders } from 'http';
import { getPlugin, isEnabled } from '../service-discovery';
import { generateRequestProcess, getEnv } from '../utils';

export type MessageProps = {
  subdomain: string;
  method?: 'query' | 'mutation';
  pluginName: string;
  module: string;
  action: string;
  input: any;
  defaultValue?: any;
  options?: TRPCRequestOptions;
  context?: TRPCContext;
};

export type TRPCContext = {
  processId?: string;
  userId?: string;
  cpUserId?: string;
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
  context: TRPCContext | undefined,
): string {
  const contextData = {
    subdomain,
    method,
    ...context,
  };
  const contextJson = JSON.stringify(contextData);
  return Buffer.from(contextJson, 'utf8').toString('base64');
}

function decodeTRPCContextHeader(headers: IncomingHttpHeaders): {
  subdomain: string;
  method: 'query' | 'mutation';
  context: TRPCContext;
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
    console.log(e, 'e');
    return defaultValue;
  }
};

export const createTRPCContext =
  <TContext>(
    trpcContext: (
      subdomain: string,
      context: any,
    ) => Promise<TContext & TRPCContext>,
  ) =>
  async ({ req }: trpcExpress.CreateExpressContextOptions) => {
    // Extract context from header (encoded) or fallback to request body/input
    const {
      subdomain,
      context: reqContext,
      method = 'query',
    } = decodeTRPCContextHeader(req.headers) || {};

    if (!subdomain || (method === 'mutation' && !reqContext)) {
      throw new Error('Invalid context');
    }

    const processInfo = generateRequestProcess();

    const context: { subdomain: string } & TRPCContext = {
      ...processInfo,
      ...reqContext,
      subdomain,
    };

    if (trpcContext) {
      return await trpcContext(subdomain, context);
    }

    return context as TContext & { subdomain: string } & TRPCContext;
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
