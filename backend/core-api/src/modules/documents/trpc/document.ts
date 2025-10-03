import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const documentTrpcRouter = t.router({
  documents: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Documents.find(query).lean();
    }),

    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Documents.findOne(query);
    }),

    print: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { _id, replacerIds, config } = input;
      const { models } = ctx;

      return await models.Documents.processDocument({
        _id,
        replacerIds,
        config,
      });
    }),
  }),
});
