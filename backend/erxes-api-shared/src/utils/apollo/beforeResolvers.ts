import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { z } from 'zod';
import { createTRPCContext } from '../trpc';
import { initializePluginConfig } from '../service-discovery';

export interface BeforeResolverParams {
  resolver: string;
  args?: any;
  user?: any;
  headers?: Record<string, any>;
}

export type BeforeResolverHandler = (
  subdomain: string,
  params: BeforeResolverParams,
) => Promise<any> | any;

export interface BeforeResolversConfig {
  resolvers: Record<string, string[]>;
  handler: BeforeResolverHandler;
}

export enum TBeforeResolversProducers {
  HANDLE = 'handle',
}

export type TBeforeResolversProducersInput = {
  [TBeforeResolversProducers.HANDLE]: BeforeResolverParams;
};

export const startBeforeResolvers = async (
  app: Express,
  pluginName: string,
  config: BeforeResolversConfig,
) => {
  const { resolvers, handler } = config || {};

  if (!handler || !resolvers) {
    return;
  }

  await initializePluginConfig(pluginName, 'beforeResolvers', { resolvers });

  const t = initTRPC.context<{ subdomain: string }>().create();

  const router = t.router({
    handle: t.procedure
      .input(
        z.object({
          subdomain: z.string(),
          data: z.object({
            resolver: z.string(),
            args: z.any(),
            user: z.any().optional(),
            headers: z.any().optional(),
          }),
        }),
      )
      .mutation(async ({ input }) => {
        return await handler(input.subdomain, input.data);
      }),
  });

  const middleware = trpcExpress.createExpressMiddleware({
    router,
    createContext: createTRPCContext(async (_subdomain, context) => context),
  });

  app.use('/beforeResolvers', middleware);
};
