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

    setInventories: t.procedure
      .input(
        z.object({
          branchId: z.string(),
          departmentId: z.string(),
          productsInfo: z.array(
            z.object({
              productId: z.string(),
              uom: z.string().optional(),
              remainder: z.number().optional(),
              cost: z.number().optional(),
              soonIn: z.number().optional(),
              soonOut: z.number().optional(),
            }),
          ),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { branchId, departmentId, productsInfo } = input;

        await models.Products.bulkWrite(
          productsInfo.map((info) => {
            const updateSet = {};
            const unSet: any = {};

            if (info.remainder) {
              updateSet[`inventories.${branchId}.${departmentId}.remainder`] =
                info.remainder;
            } else {
              unSet[`inventories.${branchId}.${departmentId}.remainder`] = 0;
            }

            if (info.cost) {
              updateSet[`inventories.${branchId}.${departmentId}.cost`] =
                info.cost;
            } else {
              unSet[`inventories.${branchId}.${departmentId}.cost`] = 0;
            }

            if (info.soonIn) {
              updateSet[`inventories.${branchId}.${departmentId}.soonIn`] =
                info.soonIn;
            } else {
              unSet[`inventories.${branchId}.${departmentId}.soonIn`] = 0;
            }

            if (info.soonOut) {
              updateSet[`inventories.${branchId}.${departmentId}.soonOut`] =
                info.soonOut;
            } else {
              unSet[`inventories.${branchId}.${departmentId}.soonOut`] = 0;
            }

            return {
              updateOne: {
                filter: { _id: info.productId },
                update: { $set: { ...updateSet }, $unset: { ...unSet } },
                upsert: true,
              },
            };
          }),
        );
      }),

    increaseInventories: t.procedure
      .input(
        z.object({
          branchId: z.string(),
          departmentId: z.string(),
          productsInfo: z.array(
            z.object({
              productId: z.string(),
              uom: z.string().optional(),
              diffCount: z.number().optional(),
              diffCost: z.number().optional(),
              diffSoonIn: z.number().optional(),
              diffSoonOut: z.number().optional(),
            }),
          ),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { branchId, departmentId, productsInfo } = input;

        await models.Products.bulkWrite(
          productsInfo.map((info) => ({
            updateOne: {
              filter: { _id: info.productId },
              update: {
                $inc: {
                  [`inventories.${branchId}.${departmentId}.remainder`]:
                    info.diffCount ?? 0,
                  [`inventories.${branchId}.${departmentId}.cost`]:
                    info.diffCost ?? 0,
                  [`inventories.${branchId}.${departmentId}.soonIn`]:
                    info.diffSoonIn ?? 0,
                  [`inventories.${branchId}.${departmentId}.soonOut`]:
                    info.diffSoonOut ?? 0,
                },
              },
              upsert: true,
            },
          })),
        );
      }),
  }),
});
