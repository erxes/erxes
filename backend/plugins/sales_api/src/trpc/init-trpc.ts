import { posTrpcRouter } from '@/pos/trpc/pos';
import { dealTrpcRouter } from '@/sales/trpc/deal';

import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { z } from 'zod';
import { generateSalesFields } from '~/modules/sales/fieldUtils';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

export const appRouter = t.router({
  deal: dealTrpcRouter,
  pos: posTrpcRouter,

  importExport: t.router({
    getExportHeaders: t.procedure
      .input(
        z.object({
          moduleName: z.string(),
          collectionName: z.string(),
        }),
      )
      .query(async ({ input }) => {
        console.log('🔥 TRPC EXPORT HIT:', input);

        const { moduleName, collectionName } = input;

        if (moduleName === 'pos' && collectionName === 'posItems') {
          return [
            {
              key: 'number',
              label: 'Number',
              isDefault: true,
              type: 'string',
            },
            {
              key: 'createdAt',
              label: 'Created Date',
              isDefault: true,
              type: 'date',
            },
          ];
        }

        return [];
      }),

    getExportData: t.procedure
      .input(
        z.object({
          moduleName: z.string(),
          collectionName: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { moduleName, collectionName } = input;

        console.log('🔥 EXPORT DATA HIT:', {
          moduleName,
          collectionName,
        });

        if (moduleName === 'pos' && collectionName === 'posItems') {
          const items = await (models as any).PosItems.find().lean();

          return items.map((item: any) => ({
            number: item.number,
            createdAt: item.createdAt,
          }));
        }

        return [];
      }),
  }),
});
