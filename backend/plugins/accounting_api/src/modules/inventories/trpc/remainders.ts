import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { AccountingTRPCContext } from '~/init-trpc';

const t = initTRPC.context<AccountingTRPCContext>().create();

export const remainderTrpcRouter = t.router({
  remainders: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;

      return await models.Remainders.getRemainders(subdomain, { ...input });
    }),
    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;

      return await models.Remainders.getRemainderCount(subdomain, { ...input });
    }),

    updateMany: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      const { branchId, departmentId, productsData } = input;

      return await models.Remainders.updateRemainders(
        subdomain,
        branchId,
        departmentId,
        productsData,
      );
    }),
  }),
  reserveRemainders: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { branchId, departmentId, productIds } = input;

      return await models.ReserveRems.find({
        branchId,
        departmentId,
        productId: { $in: productIds },
      }).lean();
    }),
  }),
});
