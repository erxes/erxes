import {
  createTRPCUntypedClient,
  httpBatchLink,
  TRPCRequestOptions,
} from '@trpc/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import { getPlugin, isEnabled } from '../service-discovery';
import { getSubdomain } from '../utils';

export type MessageProps = {
  method?: 'query' | 'mutation';
  pluginName: string;
  module: string;
  action: string;
  input: any;
  defaultValue?: any;
  options?: TRPCRequestOptions;
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

type TRPCContext = {
  subdomain: string;
};

export const sendTRPCMessage = async ({
  pluginName,
  method,
  module,
  action,
  input,
  defaultValue,
  options,
}: MessageProps) => {
  if (!method) {
    method = 'query';
  }

  if (pluginName && !(await isEnabled(pluginName))) {
    return defaultValue;
  }

  const pluginInfo = await getPlugin(pluginName);

  const client = createTRPCUntypedClient({
    links: [httpBatchLink({ url: `${pluginInfo.address}/trpc` })],
  });

  const result = await client[method](`${module}.${action}`, input, options);

  return result || defaultValue;
};

export const createTRPCContext =
  <TContext>(
    trpcContext: (
      subdomain: string,
      context: any,
    ) => Promise<TContext & TRPCContext>,
  ) =>
  async ({ req }: trpcExpress.CreateExpressContextOptions) => {
    const subdomain = getSubdomain(req);

    const context: TRPCContext = {
      subdomain,
    };

    if (trpcContext) {
      return await trpcContext(subdomain, context);
    }

    return context as TContext & TRPCContext;
  };

export type ITRPCContext<TExtraContext = {}> = Awaited<
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
