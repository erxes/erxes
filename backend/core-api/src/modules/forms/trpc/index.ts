import { initTRPC } from '@trpc/server';
import { fieldsTrpcRouter } from './fields';
import { fieldsGroupsTrpcRouter } from './fieldsGroups';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

const formsRouter = t.router({
  forms: t.router({
    findOne: t.procedure
      .input(z.object({ query: z.record(z.any()).optional() }))
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        if (!query || !Object.keys(query).length) {
          return {};
        }

        return models.Forms.findOne(query).lean();
      }),
  }),
});

export const formsTrpcRouter = t.mergeRouters(
  formsRouter,
  fieldsTrpcRouter,
  fieldsGroupsTrpcRouter,
);
