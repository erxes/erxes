import { posTrpcRouter } from '@/pos/trpc/pos';
import { dealTrpcRouter } from '@/sales/trpc/deal';
import { documentTrpcRouter } from '@/sales/trpc/document';
import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { z } from 'zod';
import { generateSalesFields } from '~/modules/sales/fieldUtils';
import { generatePosOrderFields } from '~/modules/pos/fieldUtils';
import { getDealFieldOptionUsedValues } from '@/sales/utils/fieldOptionUsedValues';
import { DEAL_PROPERTY_CONTENT_TYPE } from '@/sales/utils/pipelineProperties';

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

      // Which of a select/multiSelect/check/radio field's option values are
      // currently stored on at least one record. Called by core-api when the
      // field's contentType is owned by this plugin. Only deal properties
      // are supported so far; anything else returns null ("unknown").
      fieldOptionUsedValues: t.procedure
        .input(
          z.object({
            contentType: z.string(),
            fieldId: z.string(),
            values: z.array(z.string()),
          }),
        )
        .query(async ({ ctx, input }) => {
          const { models } = ctx;
          const { contentType, fieldId, values } = input;

          if (contentType !== DEAL_PROPERTY_CONTENT_TYPE) {
            return null;
          }

          return getDealFieldOptionUsedValues(models, fieldId, values);
        }),
    }),
  }),
);
