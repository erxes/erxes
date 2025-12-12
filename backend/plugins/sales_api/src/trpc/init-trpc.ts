import { posTrpcRouter } from '@/pos/trpc/pos';
import { dealTrpcRouter } from '@/sales/trpc/deal';
import { templateTrpcRouter } from '@/sales/trpc/template';

import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { z } from 'zod';
import { generateSalesFields } from '~/modules/sales/fieldUtils';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

export const appRouter = t.mergeRouters(
  templateTrpcRouter,
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
);

export type AppRouter = typeof appRouter;
