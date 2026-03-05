import { initTRPC } from '@trpc/server';
import { escapeRegExp, sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

const applyPipelineFilter = async ({
  models,
  subdomain,
  query,
  pipelineId,
}: {
  models: any;
  subdomain: string;
  query: any;
  pipelineId?: string;
}) => {
  if (!pipelineId) {
    return true;
  }

  const pipeline = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: 'pipeline',
    action: 'findOne',
    input: { _id: pipelineId },
    defaultValue: {},
  });

  if (!pipeline?.initialCategoryIds?.length) {
    return true;
  }

  const allowedCategoryIds = (
    await models.ProductCategories.getChildCategories(pipeline.initialCategoryIds)
  ).map((category) => category._id);

  if (!allowedCategoryIds.length) {
    return false;
  }

  if (Array.isArray(query?.categoryId?.$in)) {
    const allowedSet = new Set(allowedCategoryIds);
    query.categoryId = {
      $in: query.categoryId.$in.filter((id) => allowedSet.has(id)),
    };

    if (!query.categoryId.$in.length) {
      return false;
    }
  } else {
    query.categoryId = { $in: allowedCategoryIds };
  }

  return true;
};

export const productsTrpcRouter = t.router({
  products: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const {
        query: rawQuery,
        sort,
        skip,
        limit,
        categoryId,
        pipelineId,
        fields,
      } = input;

      const { models, subdomain } = ctx;
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

      const isPipelineValid = await applyPipelineFilter({
        models,
        subdomain,
        query,
        pipelineId,
      });

      if (!isPipelineValid) {
        return [];
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
      const { query: rawQuery, categoryId, pipelineId } = input;
      const { models, subdomain } = ctx;
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

      const isPipelineValid = await applyPipelineFilter({
        models,
        subdomain,
        query,
        pipelineId,
      });

      if (!isPipelineValid) {
        return 0;
      }

      return models.Products.find(query).countDocuments();
    }),
  }),
});
