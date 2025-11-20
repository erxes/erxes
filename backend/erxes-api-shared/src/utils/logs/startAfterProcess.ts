export * from './logHandler';
export * from './logTypes';
export * from './startAfterProcess';
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { initializePluginConfig } from '../service-discovery';
import { createTRPCContext } from '../trpc';
import { AfterProcessConfigs, IAfterProcessContext } from './logTypes';

export const startAfterProcess = async (
  app: Express,
  pluginName: string,
  config: AfterProcessConfigs,
) => {
  await initializePluginConfig(pluginName, 'afterProcess', config);

  const t = initTRPC.context<IAfterProcessContext>().create();

  const {
    onAfterMutation,
    onAfterAuth,
    onAfterApiRequest,
    onDocumentUpdated,
    onDocumentCreated,
  } = config || {};

  const routes: Record<string, any> = {};

  if (onAfterMutation) {
    routes.onAfterMutation = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => onAfterMutation(ctx, input));
  }

  if (onAfterAuth) {
    routes.onAfterAuth = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => onAfterAuth(ctx, input));
  }

  if (onAfterApiRequest) {
    routes.onAfterApiRequest = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => onAfterApiRequest(ctx, input));
  }

  if (onDocumentUpdated) {
    routes.onDocumentUpdated = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => onDocumentUpdated(ctx, input));
  }

  if (onDocumentCreated) {
    routes.onDocumentCreated = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => onDocumentCreated(ctx, input));
  }

  const afterProcessRouter = t.router(routes);

  const trpcMiddleware = trpcExpress.createExpressMiddleware({
    router: afterProcessRouter,
    createContext: createTRPCContext(async (_subdomain, context) => {
      const processId = nanoid(12);
      context.processId = processId;
      return context;
    }),
  });

  app.use('/after-process', trpcMiddleware);
};
