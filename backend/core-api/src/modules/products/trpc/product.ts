import { initTRPC } from '@trpc/server';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { PRODUCT_STATUSES } from '@/products/constants';

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
        excludeCategoryIds,
        excludeProductIds,
        fields,
        cursorParams,
      } = input;

      const { models } = ctx;

      const query = rawQuery || {};

      query.status = { $ne: PRODUCT_STATUSES.DELETED };

      if (categoryIds?.length) {
        const categories = await models.ProductCategories.find({
          _id: { $in: categoryIds },
        }).lean();

        const orderQry: any[] = categories.map((category: any) => ({
          order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
        }));

        let categoriesWithChildren = await models.ProductCategories.find({
          status: { $nin: ['disabled', 'archived'] },
          $or: orderQry,
        }).lean();

        if (excludeCategoryIds?.length) {
          const excludeCategories = await models.ProductCategories.find({
            _id: { $in: excludeCategoryIds },
          }).lean();

          const excludeOrderQry: any[] = excludeCategories.map(
            (category: any) => ({
              order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
            }),
          );

          const excludeCategoriesWithChildren =
            await models.ProductCategories.find({
              status: { $nin: ['disabled', 'archived'] },
              $or: excludeOrderQry,
            }).lean();

          const excludeCategoriesWithChildrenIds =
            excludeCategoriesWithChildren.map((category: any) => category._id);

          categoriesWithChildren = categoriesWithChildren.filter(
            (category: any) =>
              !excludeCategoriesWithChildrenIds.includes(category._id),
          );
        }

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

      if (excludeProductIds?.length) {
        query._id = { $nin: excludeProductIds };
      }

      if (cursorParams) {
        return cursorPaginate({
          model: models.Products,
          params: cursorParams,
          query,
        });
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
