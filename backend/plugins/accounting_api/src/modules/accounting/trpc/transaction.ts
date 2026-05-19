import { initTRPC } from '@trpc/server';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import sift from 'sift';
import { z } from 'zod';
import { AccountingTRPCContext } from '~/init-trpc';
import { generateFilter } from '../graphql/resolvers/queries/transactionsCommon';

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
  }),
});
