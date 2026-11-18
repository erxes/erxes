import { initTRPC } from '@trpc/server';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import sift from 'sift';
import { z } from 'zod';
import { AccountingTRPCContext } from '~/init-trpc';
import { generateFilter } from '../graphql/resolvers/queries/transactionsCommon';
import { activeCost } from '../utils/inventories';

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
        const {
          filter,
          oldTransaction,
          oldTransactions = [],
          transaction,
          transactions = [],
          userId,
        } = input;
        const { models, subdomain } = ctx;

        const user = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'users',
          action: 'findOne',
          input: { query: { _id: userId } },
          defaultValue: { _id: userId },
        });

        const filterParams = await generateFilter(
          subdomain,
          models,
          filter || {},
          user,
        );

        const oldDocs = [oldTransaction, ...oldTransactions].filter(Boolean);
        const newDocs = [transaction, ...transactions].filter(Boolean);

        const matchesOld = oldDocs.some((tr) => sift(filterParams)(tr));
        const matchesNew = newDocs.some((tr) => sift(filterParams)(tr));

        return { matchesOld, matchesNew };
      }),

    /**
     * Current unit cost per product at one inventory location, so a plugin can
     * price the transaction it sends. Pass the ids of the plugin's earlier
     * transactions in excludedTransactionIds when re-sending.
     */
    activeCost: t.procedure
      .input(
        z.object({
          accountId: z.string().min(1),
          branchId: z.string().optional(),
          departmentId: z.string().optional(),
          productIds: z.array(z.string()),
          excludedTransactionIds: z.array(z.string()).optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        return activeCost(
          ctx.models,
          input.accountId,
          input.branchId,
          input.departmentId,
          input.productIds,
          input.excludedTransactionIds || [],
        );
      }),

    /**
     * Creates a transaction group, or replaces it when parentId is given.
     * Used by other plugins (storage) that build their own transactions.
     */
    savePTransaction: t.procedure
      .input(
        z.object({
          parentId: z.string().optional(),
          docs: z.array(z.any()).min(1),
          userId: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const userId = input.userId || '';
        const options = { skipAccountPermission: true };

        const transactions = input.parentId
          ? await models.Transactions.updatePTransaction(
              input.parentId,
              input.docs,
              userId,
              options,
            )
          : await models.Transactions.createPTransaction(
              input.docs,
              userId,
              options,
            );

        return { parentId: transactions[0]?.parentId };
      }),
  }),
});
