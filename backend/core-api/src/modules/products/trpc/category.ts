import { initTRPC } from '@trpc/server';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/utils/agentMeta';

const t = initTRPC.context<CoreTRPCContext>().create();

export const productCategoryTrpcRouter = t.router({
  productCategories: t.router({
    find: t.procedure
      .meta(
        agentMeta(
          'List product categories: { query?, sort? }. Categories form a tree via parentId/order. Use this to resolve a category name or code to its _id before creating/updating products or filtering products by categoryId.',
          { module: 'products', action: 'productsRead' },
        ),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query, sort, regData } = input;
        const { models } = ctx;

        if (regData) {
          return await models.ProductCategories.find({
            ...query,
            order: { $regex: new RegExp(escapeRegExp(regData)) },
          }).sort(sort);
        }

        return models.ProductCategories.find(query).sort(sort).lean();
      }),

    findOne: t.procedure
      .meta(
        agentMeta(
          'Get a single product category by { _id }, { code }, or any MongoDB-style query. Returns {} when nothing matches. Call before productCategories.updateProductCategory.',
          { module: 'products', action: 'productsRead' },
        ),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const query = input?.query || input?.selector || input;
        const { models } = ctx;
        if (!query || !Object.keys(query).length) {
          return {};
        }

        const productCategory =
          await models.ProductCategories.findOne(query).lean();

        return productCategory;
      }),

    withChilds: t.procedure
      .meta(
        agentMeta(
          'Get categories plus ALL their descendants. Input: { ids: ["categoryId", ...] }. Use to gather every subcategory under a parent, e.g. before bulk product operations across a whole category tree. (products.find/count already expand a single categoryId automatically.)',
          { module: 'products', action: 'productsRead' },
        ),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { ids } = input;
        const { models } = ctx;

        const productCategories =
          await models.ProductCategories.getChildCategories(ids);

        return productCategories;
      }),

    createProductCategory: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { doc } = input;
        const { models } = ctx;

        return models.ProductCategories.createProductCategory(doc);
      }),

    updateProductCategory: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { _id, doc } = input;
        const { models } = ctx;

        return models.ProductCategories.updateProductCategory(_id, doc);
      }),

    removeProductCategory: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { _id } = input;
        const { models } = ctx;

        return models.ProductCategories.removeProductCategory(_id);
      }),

    count: t.procedure
      .meta(
        agentMeta('Count product categories matching a filter: { query? }.', {
          module: 'products',
          action: 'productsRead',
        }),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return models.ProductCategories.countDocuments(query);
      }),
  }),
});
