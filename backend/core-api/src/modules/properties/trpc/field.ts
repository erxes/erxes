import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const fieldTrpcRouter = t.router({
  fields: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, projection, sort } = input;

      return models.Fields.find(query, projection).sort(sort).lean();
    }),
  }),
});
