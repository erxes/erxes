import { posTrpcRouter } from '@/pos/trpc/pos';
import { dealTrpcRouter } from '@/sales/trpc/deal';

import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { z } from 'zod';
import { generateSalesFields } from '~/modules/sales/fieldUtils';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

const dealsNamedRouter = t.router({
  deals: t.router({
    updateOne: t.procedure
      .input(
        z.object({
          selector: z.any(),
          modifier: z.any(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { selector, modifier } = input;
        const deal = await models.Deals.findOne(selector);
        if (!deal) throw new Error('Deal not found');
        return await models.Deals.updateDeal(deal._id, modifier.$set);
      }),
  }),
});
export const appRouter = t.mergeRouters(
  dealTrpcRouter,
  posTrpcRouter,
  t.router({
    fields: t.router({
      getFieldList: t.procedure
        .input(
          z.object({
            moduleType: z.string(),
            collectionType: z.string().optional(),
            segmentId: z.string().optional(),
            usageType: z.string().optional(),
            config: z.record(z.any()).optional(),
          }),
        )
        .query(async ({ ctx, input }) => {
          const { models, subdomain } = ctx;
          const { moduleType } = input;
          if (moduleType === 'sales') {
            return await generateSalesFields(subdomain, models, input);
          }

          return [];
        }),
    }),
  }),
  dealsNamedRouter,
);

export type AppRouter = typeof appRouter;
