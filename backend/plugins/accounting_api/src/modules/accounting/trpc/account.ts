import { initTRPC } from '@trpc/server';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { AccountingTRPCContext } from '~/init-trpc';

const t = initTRPC.context<AccountingTRPCContext>().create();

export const accountTrpcRouter = t.router({
  accountingAccount: t.router({
    getAccount: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Accounts.findOne(query).lean();
    }),
    getAccountCategory: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return await models.AccountCategories.findOne(query).lean();
      }),
    getAccountCategories: t.procedure
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
