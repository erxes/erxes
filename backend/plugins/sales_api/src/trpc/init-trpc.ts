import { posTrpcRouter } from '@/pos/trpc/pos';
import { dealTrpcRouter } from '@/sales/trpc/deal';
import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { z } from 'zod';
import { generateSalesFields } from '~/modules/sales/fieldUtils';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

// Common input schema for field queries
const fieldQueryInput = z.object({
  moduleType: z.string(),
  collectionType: z.string().optional(),
  segmentId: z.string().optional(),
  usageType: z.string().optional(),
  config: z.record(z.any()).optional(),
});

// Factory to create a field list procedure for a specific module
const createFieldListProcedure = (fieldGenerator: (subdomain: string, models: IModels, input: any) => Promise<any[]>) => {
  return t.procedure.input(fieldQueryInput).query(async ({ ctx, input }) => {
    const { models, subdomain } = ctx;
    return fieldGenerator(subdomain, models, input);
  });
};

export const appRouter = t.mergeRouters(
  dealTrpcRouter,
  posTrpcRouter,
  t.router({
    fields: t.router({
      // Use the factory with sales-specific generator
      getFieldList: createFieldListProcedure(async (subdomain, models, input) => {
        if (input.moduleType === 'sales') {
          return await generateSalesFields(subdomain, models, input);
        }
        return [];
      }),
    }),
  }),
);

export type AppRouter = typeof appRouter;