import { createScopedEventHandlers } from '../../core-modules/common/eventHandlers/generateEventHandlers';
import {
  createTRPCUntypedClient,
  httpBatchLink,
  TRPCRequestOptions,
} from '@trpc/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createHmac, timingSafeEqual } from 'crypto';
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

type CommonTRPCContext = {
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

const TRPC_CONTEXT_SIG_SEPARATOR = '.';

/**
 * Secret used to sign/verify the x-trpc-context header. Every backend service
 * shares the same value (the auth JWT secret), so a header signed by one
 * service verifies in another. The header carries tenant + caller context
 * across the internal service-to-service mesh; it is NOT user-facing API.
 *
 * Because a request arriving from the public gateway cannot reproduce a valid
 * HMAC without this secret, anonymous callers can no longer mint a context and
 * reach the raw Mongoose tRPC procedures.
 *
 * There is intentionally NO default value. Falling back to a hardcoded secret
 * (e.g. 'SECRET') would let anyone reproduce the HMAC and re-open the
 * unauthenticated tRPC CRUD hole this signing is meant to close, so we fail
 * closed: every sign/verify call throws until JWT_TOKEN_SECRET is configured.
 */
function getTRPCContextSecret(): string {
  const secret = process.env.JWT_TOKEN_SECRET;

  if (!secret || secret.trim() === '') {
    throw new Error(
      'JWT_TOKEN_SECRET is required to sign and verify the x-trpc-context ' +
        'header used for service-to-service tRPC authentication. Set ' +
        'JWT_TOKEN_SECRET to the same value across all backend services ' +
        'before starting; refusing to run with an unauthenticated tRPC mesh.',
    );
  }

  return secret;
}

/**
 * Eagerly validate JWT_TOKEN_SECRET so a misconfigured service fails fast at
 * startup (this is called when the tRPC route handler is built) instead of
 * silently degrading (sendTRPCMessage swallows errors and returns defaults) or
 * only erroring on the first inbound request.
 */
export function assertTRPCContextSecret(): void {
  getTRPCContextSecret();
}

function signTRPCContext(contextBase64: string): string {
  return createHmac('sha256', getTRPCContextSecret())
    .update(contextBase64)
    .digest('base64url');
}

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
  const contextBase64 = Buffer.from(
    JSON.stringify(contextData),
    'utf8',
  ).toString('base64');
  const signature = signTRPCContext(contextBase64);
  return `${contextBase64}${TRPC_CONTEXT_SIG_SEPARATOR}${signature}`;
}

function decodeTRPCContextHeader(headers: IncomingHttpHeaders): {
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

  const separatorIndex = contextHeader.lastIndexOf(TRPC_CONTEXT_SIG_SEPARATOR);
  if (separatorIndex === -1) {
    return null;
  }
  const contextBase64 = contextHeader.slice(0, separatorIndex);
  const signature = contextHeader.slice(separatorIndex + 1);
  const expectedSignature = signTRPCContext(contextBase64);

  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (
    signatureBuf.length !== expectedBuf.length ||
    !timingSafeEqual(signatureBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const contextJson = Buffer.from(contextBase64, 'base64').toString('utf-8');
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

export const createTRPCContext = <TContext>(
  trpcContext: (
    subdomain: string,
    context: any,
  ) => Promise<TContext & TRPCContext>,
) => {
  // Runs once per service when the tRPC route handler is built (i.e. at
  // startup): fail fast if the signing secret is missing rather than only
  // erroring on the first inbound request.
  assertTRPCContextSecret();

  return async ({ req }: trpcExpress.CreateExpressContextOptions) => {
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

    const context: RequestTRPCContext = {
      ...processInfo,
      ...reqContext,
      subdomain,
    };

    setEventHandlerRuntimeContext(subdomain, {
      subdomain,
      processId: context.processId || '',
      userId: context.userId || '',
    });

    const eventHandlers = createScopedEventHandlers(subdomain, {
      subdomain,
      processId: context.processId || '',
      userId: context.userId || '',
    });

    if (trpcContext) {
      return await trpcContext(subdomain, {
        ...context,
        eventHandlers,
      });
    }

    return {
      ...(context as TContext & RequestTRPCContext),
      eventHandlers,
    };
  };
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
