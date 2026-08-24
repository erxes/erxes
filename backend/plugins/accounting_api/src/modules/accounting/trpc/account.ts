import { initTRPC } from '@trpc/server';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { AccountingTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/trpc/agentMeta';

const t = initTRPC.context<AccountingTRPCContext>().create();

export const accountTrpcRouter = t.router({
  accountingAccount: t.router({
    getAccount: t.procedure
      .meta(
        agentMeta(
          'Get one accounting account (chart-of-accounts entry) by a Mongo filter, e.g. { query: { code: "1010" } } or { query: { _id } }. Returns the full account document or null.',
          { module: 'account', action: 'accountsRead' },
        ),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return await models.Accounts.findOne(query).lean();
      }),
    getAccountCategory: t.procedure
      .meta(
        agentMeta(
          'Get one accounting account category by a Mongo filter, e.g. { query: { code: "1" } } or { query: { _id } }. Returns the category document or null.',
          { module: 'accountCategory', action: 'readAccountCategories' },
        ),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return await models.AccountCategories.findOne(query).lean();
      }),
    getAccountCategories: t.procedure
      .meta(
        agentMeta(
          'List accounting account categories. Input: { query?, sort? }, e.g. { query: { status: "active" }, sort: { order: 1 } }. Optional regData matches categories whose order path starts with a prefix. Use getAccountCategoriesWithChilds when you already have parent ids.',
          { module: 'accountCategory', action: 'readAccountCategories' },
        ),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query, sort, regData } = input;
        const { models } = ctx;

        return regData
          ? await models.AccountCategories.find({
              ...query,
              order: { $regex: new RegExp(regData) },
            }).sort(sort)
          : await models.AccountCategories.find(query).sort(sort).lean();
      }),
    getAccountCategoriesWithChilds: t.procedure
      .meta(
        agentMeta(
          'List active accounting account categories under given parents. Input: { _id } (single parent) or { ids: [...] } (many); returns every non-disabled descendant ordered by their order path. Returns [] when no ids are given.',
          { module: 'accountCategory', action: 'readAccountCategories' },
        ),
      )
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
