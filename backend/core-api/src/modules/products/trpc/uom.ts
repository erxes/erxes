import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const uomTrpcRouter = t.router({
  productUoms: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;

      const { models } = ctx;

      return models.Uoms.find(query).lean();
    }),

    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;

      const { models } = ctx;

      return models.Uoms.findOne(query).lean();
    }),
  }),
});
