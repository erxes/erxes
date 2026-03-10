import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { AccountingTRPCContext } from '~/init-trpc';

const t = initTRPC.context<AccountingTRPCContext>().create();

export const remainderTrpcRouter = t.router({
  remainders: t.router({
    
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
