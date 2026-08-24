import { initTRPC } from '@trpc/server';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import sift from 'sift';
import { z } from 'zod';
import { AccountingTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/trpc/agentMeta';
import { generateFilter } from '../graphql/resolvers/queries/transactionsCommon';

const t = initTRPC.context<AccountingTRPCContext>().create();

// Agent-facing reads must stay bounded: an unbounded find over every
// accounting transaction can materialize the whole collection in memory
// before the agent-tools response cap can reject it.
const AGENT_FIND_DEFAULT_LIMIT = 20;
const AGENT_FIND_MAX_LIMIT = 100;

export const transactionTrpcRouter = t.router({
  accountingTransaction: t.router({
    getTransactions: t.procedure
      .meta(
        agentMeta(
          'List accounting transactions matching a Mongo filter. Input: { query?, limit? }, e.g. { query: { journal: "main", "details.debit": 1000 } }. Results are capped at 100 rows (default 20); narrow the filter and page with skip-style filters instead of fetching everything. Use count-style questions carefully — prefer a narrow query.',
          { module: 'transaction', action: 'readTransactions' },
        ),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query, limit } = input || {};
        const { models } = ctx;

        const safeLimit =
          typeof limit === 'number' && limit > 0
            ? Math.min(Math.floor(limit), AGENT_FIND_MAX_LIMIT)
            : AGENT_FIND_DEFAULT_LIMIT;

        return await models.Transactions.find(query)
          .limit(safeLimit)
          .lean();
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
