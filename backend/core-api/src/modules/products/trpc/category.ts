import { initTRPC } from '@trpc/server';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const productCategoryTrpcRouter = t.router({
  productCategories: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
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

    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      const productCategory =
        await models.ProductCategories.findOne(query).lean();

      return productCategory;
    }),

    withChilds: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { _ids } = input;
      const { models } = ctx;

      const productCategories =
        await models.ProductCategories.getChildCategories(_ids);

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

    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return models.ProductCategories.countDocuments(query);
    }),
    categories: t.router({
      withChilds: t.procedure
        .input(z.object({ ids: z.array(z.string()) }))
        .query(async ({ ctx, input }) => {
          const { models } = ctx;
          const { ids } = input;

          // Reuse the existing method from ProductCategories model
          const productCategories =
            await models.ProductCategories.getChildCategories(ids);
          return productCategories;
        }),
    }),
  }),
});
