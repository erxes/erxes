import { AnyProcedure, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { nanoid } from 'nanoid';
import { createTRPCContext, initializePluginConfig } from '../../utils';
import { SegmentConfigs, TSegmentProducers } from './types';
import {
  ApplyMembershipInput,
  CountSegmentMembersInput,
  EvaluateFieldsInput,
  ListSegmentMembersInput,
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
    evaluateFields,
    listSegmentMembers,
    countSegmentMembers,
    applyMembership,
  } = config || {};

  const segmentProducers: Partial<Record<TSegmentProducers, AnyProcedure>> = {};

  if (evaluateFields) {
    segmentProducers[TSegmentProducers.EVALUATE_FIELDS] = t.procedure
      .input(EvaluateFieldsInput)
      .query(async ({ ctx, input }) => evaluateFields(input, ctx));
  }

  if (listSegmentMembers) {
    segmentProducers[TSegmentProducers.LIST_MEMBERS] = t.procedure
      .input(ListSegmentMembersInput)
      .query(async ({ ctx, input }) => listSegmentMembers(input, ctx));
  }

  if (countSegmentMembers) {
    segmentProducers[TSegmentProducers.COUNT_MEMBERS] = t.procedure
      .input(CountSegmentMembersInput)
      .query(async ({ ctx, input }) => countSegmentMembers(input, ctx));
  }

  if (applyMembership) {
    segmentProducers[TSegmentProducers.APPLY_MEMBERSHIP] = t.procedure
      .input(ApplyMembershipInput)
      .mutation(async ({ ctx, input }) => applyMembership(input, ctx));
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
