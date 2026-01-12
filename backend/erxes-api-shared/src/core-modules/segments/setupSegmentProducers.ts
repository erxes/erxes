import { AnyProcedure, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { nanoid } from 'nanoid';
import { createTRPCContext, initializePluginConfig } from '../../utils';
import { SegmentConfigs, TSegmentProducers } from './types';
import {
  AssociationFilterInput,
  EsTypesMapInput,
  InitialSelectorInput,
  PropertyConditionExtenderInput,
} from './zodSchemas';

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

  const segmentProducers: Partial<Record<TSegmentProducers, AnyProcedure>> = {};

  if (propertyConditionExtender) {
    segmentProducers[TSegmentProducers.PROPERTY_CONDITION_EXTENDER] =
      t.procedure
        .input(PropertyConditionExtenderInput)
        .query(async ({ ctx, input }) => propertyConditionExtender(input, ctx));
  }

  if (associationFilter) {
    segmentProducers[TSegmentProducers.ASSOCIATION_FILTER] = t.procedure
      .input(AssociationFilterInput)
      .query(async ({ ctx, input }) => associationFilter(input, ctx));
  }

  if (initialSelector) {
    segmentProducers[TSegmentProducers.INITIAL_SELECTOR] = t.procedure
      .input(InitialSelectorInput)
      .query(async ({ ctx, input }) => initialSelector(input, ctx));
  }

  if (esTypesMap) {
    segmentProducers[TSegmentProducers.ES_TYPES_MAP] = t.procedure
      .input(EsTypesMapInput)
      .query(async ({ ctx, input }) => esTypesMap(input, ctx));
  }

  if (!Object.keys(segmentProducers)?.length) {
    console.warn(
      `[Segments] No segment producers found for plugin ${pluginName}`,
    );
    return;
  }

  const segmentsRouter = t.router(segmentProducers);

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
