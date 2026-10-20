import {
  applyContactFieldsSync,
  findContactFieldsRecords,
  TContactFieldsFind,
  TContactFieldsSync,
} from 'erxes-api-shared/core-modules';
import { posTrpcRouter } from '@/pos/trpc/pos';
import { dealTrpcRouter } from '@/sales/trpc/deal';
import { documentTrpcRouter } from '@/sales/trpc/document';
import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { z } from 'zod';
import { generateSalesFields } from '~/modules/sales/fieldUtils';
import { generatePosOrderFields } from '~/modules/pos/fieldUtils';

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
const createFieldListProcedure = (
  fieldGenerator: (
    subdomain: string,
    models: IModels,
    input: z.infer<typeof fieldQueryInput>,
  ) => Promise<unknown[]>,
) => {
  return t.procedure.input(fieldQueryInput).query(async ({ ctx, input }) => {
    const { models, subdomain } = ctx;
    return fieldGenerator(subdomain, models, input);
  });
};

export const appRouter = t.mergeRouters(
  dealTrpcRouter,
  posTrpcRouter,
  documentTrpcRouter,
  t.router({
    fields: t.router({
      getFieldList: createFieldListProcedure(
        async (subdomain, models, input) => {
          if (input.moduleType === 'sales') {
            return await generateSalesFields(subdomain, models, input);
          }

          if (input.moduleType === 'pos') {
            return await generatePosOrderFields(models);
          }

          return [];
        },
      ),
    }),
  }),
  t.router({
    contactFields: t.router({
      // Core reads record ↔ contact links from the fields through this.
      find: t.procedure
        .input(z.custom<TContactFieldsFind>())
        .query(async ({ ctx, input }) => {
          const { models, subdomain } = ctx;

          if (input.contentType !== 'sales:deal') {
            return null;
          }

          return findContactFieldsRecords(
            models.Deals,
            `${subdomain}:deals`,
            input,
          );
        }),
      // Core keeps these records' customerIds / companyIds in step with
      // relations; see erxes-api-shared contact-fields.
      sync: t.procedure
        .input(z.custom<TContactFieldsSync>())
        .mutation(async ({ ctx, input }) => {
          const { models } = ctx;

          await applyContactFieldsSync({ 'sales:deal': models.Deals }, input);
        }),
    }),
  }),
);
