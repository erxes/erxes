import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { AccountingTRPCContext } from '~/init-trpc';
import {
  getListChangeRows,
  getListFilterMatches,
  LIST_CHANGE_ROWS_LIMIT,
} from '@/accounting/utils/transactionListRows';

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
    getFilterMatches: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const {
          filter,
          oldTransaction,
          oldTransactions = [],
          transaction,
          transactions = [],
          userId,
        } = input;

        return await getListFilterMatches({
          models,
          subdomain,
          userId,
          filter: filter || {},
          oldDocs: [oldTransaction, ...oldTransactions],
          newDocs: [transaction, ...transactions],
        });
      }),
    getListChangeRows: t.procedure
      .input(
        z.object({
          userId: z.string().min(1),
          list: z.enum(['transactions', 'trRecords']),
          trIds: z.array(z.string()).min(1).max(LIST_CHANGE_ROWS_LIMIT),
          trJournals: z.record(z.string(), z.array(z.string())).default({}),
          filter: z.record(z.string(), z.unknown()).nullish(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        return await getListChangeRows({
          models,
          subdomain,
          ...input,
          filter: input.filter ?? undefined,
        });
      }),
  }),
});
