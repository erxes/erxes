import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { z } from 'zod';
import { createTRPCContext } from '../trpc';
import { initializePluginConfig } from '../service-discovery';

export interface BeforeResolverParams {
  resolver: string;
  args?: Record<string, unknown>;
  user?: unknown;
  headers?: Record<string, unknown>;
}

export type BeforeResolverOkResult = {
  status: 'ok';
  args?: Record<string, unknown>;
};

export type BeforeResolverBlockedResult = {
  status: 'blocked';
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type BeforeResolverResolvedResult = {
  status: 'resolved';
  data: unknown;
};

export type BeforeResolverResult =
  | BeforeResolverOkResult
  | BeforeResolverBlockedResult
  | BeforeResolverResolvedResult
  | Record<string, unknown>
  | null
  | undefined;

export type BeforeResolverHandler = (
  subdomain: string,
  params: BeforeResolverParams,
) => Promise<BeforeResolverResult> | BeforeResolverResult;

export interface BeforeResolversConfig {
  resolvers: Record<string, string[]>;
  handler: BeforeResolverHandler;
  check?: BeforeResolverHandler;
  blocker?: BeforeResolverHandler;
}

export enum TBeforeResolversProducers {
  HANDLE = 'handle',
  CHECK = 'check',
  BLOCKER = 'blocker',
}

export type TBeforeResolversProducersInput = {
  [TBeforeResolversProducers.HANDLE]: BeforeResolverParams;
  [TBeforeResolversProducers.CHECK]: BeforeResolverParams;
  [TBeforeResolversProducers.BLOCKER]: BeforeResolverParams;
};

const beforeResolverInput = z.object({
  subdomain: z.string(),
  data: z.object({
    resolver: z.string(),
    args: z.record(z.unknown()).optional(),
    user: z.unknown().optional(),
    headers: z.record(z.unknown()).optional(),
  }),
});

export const startBeforeResolvers = async (
  app: Express,
  pluginName: string,
  config: BeforeResolversConfig,
) => {
  const { resolvers, handler, check, blocker } = config || {};

  if (!handler || !resolvers) {
    return;
  }

  await initializePluginConfig(pluginName, 'beforeResolvers', { resolvers });

  const t = initTRPC.context<{ subdomain: string }>().create();

  const router = t.router({
    handle: t.procedure
      .input(beforeResolverInput)
      .mutation(async ({ input }) => {
        return await handler(input.subdomain, input.data);
      }),
    check: t.procedure.input(beforeResolverInput).query(async ({ input }) => {
      if (check) {
        return await check(input.subdomain, input.data);
      }

      return { status: 'ok' };
    }),
    blocker: t.procedure.input(beforeResolverInput).query(async ({ input }) => {
      if (blocker) {
        return await blocker(input.subdomain, input.data);
      }

      return { status: 'ok' };
    }),
  });

  const middleware = trpcExpress.createExpressMiddleware({
    router,
    createContext: createTRPCContext(async (_subdomain, context) => context),
  });

  app.use('/beforeResolvers', middleware);
};
