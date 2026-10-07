import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

// Selling screens read the conditions a product's group offers.
export const productConditionGroupTrpcRouter = t.router({
  productConditionGroups: t.router({
    find: t.procedure
      .input(z.object({ ids: z.array(z.string()).optional() }))
      .query(async ({ ctx, input }) => {
        const query = input.ids ? { _id: { $in: input.ids } } : {};

        return ctx.models.ProductConditionGroups.find(query)
          .sort({ createdAt: 1 })
          .lean();
      }),
  }),
});
