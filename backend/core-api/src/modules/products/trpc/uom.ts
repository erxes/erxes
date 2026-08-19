import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const uomTrpcRouter = t.router({
  productUoms: t.router({
    find: t.procedure
      .meta({
        agent: {
          description:
            'List units of measure (UOM): { query? }. Use to resolve a UOM code/name to the exact value expected in products.createProduct doc.uom.',
          permission: { module: 'products', action: 'productsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const { query } = input;

      const { models } = ctx;

      return models.Uoms.find(query).lean();
    }),

    findOne: t.procedure
      .meta({
        agent: {
          description:
            'Get a single unit of measure by { _id }, { code }, or any MongoDB-style query. Returns {} when nothing matches.',
          permission: { module: 'products', action: 'productsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const query = input?.query || input?.selector || input;

      const { models } = ctx;

      if (!query || !Object.keys(query).length) {
        return {};
      }

      return models.Uoms.findOne(query).lean();
    }),
  }),
});
