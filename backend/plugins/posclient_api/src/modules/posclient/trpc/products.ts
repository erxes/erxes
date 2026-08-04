import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { PosTRPCContext } from '~/init-trpc';

const t = initTRPC.context<PosTRPCContext>().create();

export const productsTrpcRouter = t.router({
  products: t.router({
    findByToken: t.procedure
      .input(z.object({ token: z.string() }))
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { token } = input;

        const products = await models.Products.find({
          tokens: token,
        }).lean();

        return products;
      }),
  }),
});
