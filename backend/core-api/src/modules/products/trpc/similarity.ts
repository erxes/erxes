import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const similaritiesTrpcRouter = t.router({
  find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { query = {}, sort = {}, skip, limit } = input || {};

    let cursor = ctx.models.ProductSimilarities.find(query).sort(sort);

    if (skip) cursor = cursor.skip(skip);
    if (limit) cursor = cursor.limit(limit);

    return cursor.lean();
  }),

  findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    return ctx.models.ProductSimilarities.findOne(input || {}).lean();
  }),

  add: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    return ctx.models.ProductSimilarities.addSimilarity(input);
  }),

  edit: t.procedure
    .input(z.object({ _id: z.string() }).passthrough())
    .mutation(async ({ ctx, input }) => {
      const { _id, ...doc } = input;
      return ctx.models.ProductSimilarities.editSimilarity(_id, doc as any);
    }),

  remove: t.procedure
    .input(z.object({ _id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.models.ProductSimilarities.removeSimilarity(input._id);
    }),
});
