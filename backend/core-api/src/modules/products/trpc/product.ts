import { initTRPC } from '@trpc/server';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const productsTrpcRouter = t.router({
  products: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const {
        query: rawQuery,
        sort,
        skip,
        limit,
        categoryId,
        categoryIds,
        fields,
      } = input;

      const { models } = ctx;

      const query = rawQuery || {};

      if (categoryIds?.length) {
        const categories = await models.ProductCategories.find({
          _id: { $in: categoryIds },
        }).lean();

        const orderQry: any[] = categories.map((category: any) => ({
          order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
        }));

        const categoriesWithChildren = await models.ProductCategories.find({
          status: { $nin: ['disabled', 'archived'] },
          $or: orderQry,
        }).lean();

        query.categoryId = {
          $in: categoriesWithChildren.map((category: any) => category._id),
        };
      }

      if (categoryId) {
        const category = await models.ProductCategories.findOne({
          _id: categoryId,
        }).lean();

        if (!category) {
          throw new Error(`ProductCategory ${categoryId} not found`);
        }

        const categories = await models.ProductCategories.find({
          order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
        }).lean();

        query.categoryId = { $in: categories.map((c) => c._id) };
      }

      return models.Products.find(query, fields || {})
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0)
        .lean();
    }),

    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return models.Products.findOne(query).lean();
    }),

    createProduct: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { doc } = input;
        const { models } = ctx;

        return models.Products.createProduct(doc);
      }),

    updateProduct: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { _id, doc } = input;
        const { models } = ctx;

        return models.Products.updateProduct(_id, doc);
      }),

    updateProducts: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { query, doc } = input;
        const { models } = ctx;

        return models.Products.updateMany(query, doc);
      }),

    removeProducts: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { _ids } = input;
        const { models } = ctx;

        return models.Products.removeProducts(_ids);
      }),

    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query: rawQuery, categoryId } = input;
      const { models } = ctx;

      const query = rawQuery || {};

      if (categoryId) {
        const category = await models.ProductCategories.findOne({
          _id: categoryId,
        }).lean();
        if (!category) {
          throw new Error(`ProductCategory ${categoryId} not found`);
        }
        const categories = await models.ProductCategories.find({
          order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
        }).lean();

        query.categoryId = { $in: categories.map((c) => c._id) };
      }

      return models.Products.find(query).countDocuments();
    }),
  }),
});
