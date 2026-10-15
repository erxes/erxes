import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

// Selling screens read the names behind a product's condition codes.
export const productConditionTrpcRouter = t.router({
  productConditions: t.router({
    find: t.procedure
      .input(z.object({ codes: z.array(z.string()).optional() }))
      .query(async ({ ctx, input }) => {
        const query = input.codes ? { code: { $in: input.codes } } : {};

        return ctx.models.ProductConditions.find(query)
          .sort({ createdAt: 1 })
          .lean();
      }),
  }),
});
