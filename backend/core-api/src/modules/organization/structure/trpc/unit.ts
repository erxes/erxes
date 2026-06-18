import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const unitTrpcRouter = t.router({
  units: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, fields } = input;

      return await models.Units.find(query, fields).lean();
    }),

    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const query = input?.query || input?.selector || input;
      const { models } = ctx;

      if (!query || !Object.keys(query).length) {
        return {};
      }

      return await models.Units.findOne(query).lean();
    }),
  }),
});
