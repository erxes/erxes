import { initTRPC } from '@trpc/server';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { AccountingTRPCContext } from '~/init-trpc';

const t = initTRPC.context<AccountingTRPCContext>().create();

// Agent-facing list reads must stay bounded: an unbounded find can
// materialize a whole collection in memory before the agent-tools response
// cap is able to reject the result.
const AGENT_FIND_DEFAULT_LIMIT = 20;
const AGENT_FIND_MAX_LIMIT = 100;

const safeAgentLimit = (limit: unknown): number =>
  typeof limit === 'number' && Number.isFinite(limit) && limit > 0
    ? Math.max(1, Math.min(Math.floor(limit), AGENT_FIND_MAX_LIMIT))
    : AGENT_FIND_DEFAULT_LIMIT;

export const accountTrpcRouter = t.router({
  accountingAccount: t.router({
    getAccount: t.procedure
      .meta({
        agent: {
          description:
            'Get one accounting account (chart-of-accounts entry) by a Mongo filter, e.g. { query: { code: "1010" } } or { query: { _id } }. Returns the full account document or null.',
          permission: { module: 'account', action: 'accountsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return await models.Accounts.findOne(query).lean();
      }),
    getAccountCategory: t.procedure
      .meta({
        agent: {
          description:
            'Get one accounting account category by a Mongo filter, e.g. { query: { code: "1" } } or { query: { _id } }. Returns the category document or null.',
          permission: { module: 'accountCategory', action: 'readAccountCategories' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return await models.AccountCategories.findOne(query).lean();
      }),
    getAccountCategories: t.procedure
      .meta({
        agent: {
          description:
            'List accounting account categories. Input: { query?, sort?, limit? }, e.g. { query: { status: "active" }, sort: { order: 1 } }. Results are capped at 100 rows (default 20); narrow the filter instead of fetching everything. Optional regData matches categories whose order path starts with a prefix. Use getAccountCategoriesWithChilds when you already have parent ids.',
          permission: { module: 'accountCategory', action: 'readAccountCategories' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query, sort, regData, limit } = input || {};
        const { models } = ctx;

        const safeLimit = safeAgentLimit(limit);

        return regData
          ? await models.AccountCategories.find({
              ...query,
              order: { $regex: new RegExp(regData) },
            })
              .sort(sort)
              .limit(safeLimit)
              .lean()
          : await models.AccountCategories.find(query)
              .sort(sort)
              .limit(safeLimit)
              .lean();
      }),
    getAccountCategoriesWithChilds: t.procedure
      .meta({
        agent: {
          description:
            'List active accounting account categories under given parents. Input: { _id } (single parent) or { ids: [...] } (many); returns every non-disabled descendant ordered by their order path. Returns [] when no ids are given.',
          permission: { module: 'accountCategory', action: 'readAccountCategories' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { _id, ids } = input;
        const categoryIds = _id ? [_id] : ids || [];
        if (!categoryIds.length) {
          return [];
        }

        const categories = await models.AccountCategories.find({
          _id: { $in: categoryIds },
        }).lean();

        if (!categories.length) {
          return [];
        }

        const orderQry: any[] = [];
        for (const category of categories) {
          orderQry.push({
            order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
          });
        }

        return await models.AccountCategories.find({
          status: { $nin: ['disabled', 'archived'] },
          $or: orderQry,
        })
          .sort({ order: 1 })
          .lean();
      }),
  }),
});
