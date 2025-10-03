import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { AccountingTRPCContext } from '~/init-trpc';

const t = initTRPC.context<AccountingTRPCContext>().create();

export const transactionTrpcRouter = t.router({
  accountingTransaction: t.router({
    getTransactions: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return await models.Transactions.find(query).lean();
      }),
  }),
});
