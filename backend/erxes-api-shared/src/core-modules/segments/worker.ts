import { initializePluginConfig, createTRPCContext } from '../../utils';
import { SegmentConfigs, TSegmentProducers } from './types';
import { Express } from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { initTRPC } from '@trpc/server';
import { nanoid } from 'nanoid';
import { z } from 'zod';

export const initSegmentProducers = async (
  app: Express,
  pluginName: string,
  config: SegmentConfigs,
) => {
  await initializePluginConfig(pluginName, 'segments', config);

  const t = initTRPC
    .context<{ subdomain: string; processId: string }>()
    .create();

  const {
    propertyConditionExtender,
    associationFilter,
    initialSelector,
    esTypesMap,
  } = config || {};

  const routes: Record<
    string,
    ReturnType<typeof t.procedure.query | typeof t.procedure.mutation>
  > = {};

  if (propertyConditionExtender) {
    routes[TSegmentProducers.PROPERTY_CONDITION_EXTENDER] = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) =>
        propertyConditionExtender(ctx, input),
      );
  }

  if (associationFilter) {
    routes[TSegmentProducers.ASSOCIATION_FILTER] = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => associationFilter(ctx, input));
  }

  if (initialSelector) {
    routes[TSegmentProducers.INITIAL_SELECTOR] = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => initialSelector(ctx, input));
  }

  if (esTypesMap) {
    routes[TSegmentProducers.ES_TYPES_MAP] = t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => esTypesMap(ctx, input));
  }

  const segmentsRouter = t.router(routes);

  const trpcMiddleware = trpcExpress.createExpressMiddleware({
    router: segmentsRouter,
    createContext: createTRPCContext(async (_subdomain, context) => {
      const processId = nanoid(12);
      context.processId = processId;
      return context;
    }),
  });

  app.use('/segments', trpcMiddleware);
};
