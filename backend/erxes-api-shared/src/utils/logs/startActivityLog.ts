import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { nanoid } from 'nanoid';
import { initializePluginConfig } from '../service-discovery';
import { createTRPCContext } from '../trpc/utils';
import { TActivityLogConfigs, TActivityLogContext } from './activityLogTypes';
import { ActivityGetterInput } from '../../core-modules/logs/zodSchemas';
import { MutationProcedure } from '@trpc/server/unstable-core-do-not-import';

export const startActivityLog = async (
  app: Express,
  pluginName: string,
  config: TActivityLogConfigs,
) => {
  await initializePluginConfig(pluginName, 'activityLog', config);
  const t = initTRPC.context<TActivityLogContext>().create();
  const { activityGetter } = config || {};
  const routes: Record<string, MutationProcedure<any>> = {};

  if (activityGetter) {
    routes.activityGetter = t.procedure
      .input(ActivityGetterInput)
      .mutation(async ({ ctx, input }) => activityGetter(input, ctx));
  }
  const activityLogRouter = t.router(routes);

  const trpcMiddleware = trpcExpress.createExpressMiddleware({
    router: activityLogRouter,
    createContext: createTRPCContext(async (_subdomain, context) => {
      const processId = nanoid(12);
      context.processId = processId;
      return context;
    }),
  });

  app.use('/activityLog', trpcMiddleware);
};
