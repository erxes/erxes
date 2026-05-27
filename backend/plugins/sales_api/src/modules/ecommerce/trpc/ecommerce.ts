import { initTRPC } from '@trpc/server';
import {
  cursorPaginate,
  ITRPCContext,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
export type EcommerceTRPCContext = ITRPCContext<{
  models: IModels;
}>;
const t = initTRPC.context<EcommerceTRPCContext>().create();
export const ecommerceTrpcRouter = t.router({
  productReview: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return await models.ProductReview.findOne(input).lean();
    }),
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, skip, limit, sort = {} } = input;
      if (!query) {
        return await models.ProductReview.find(input).lean();
      }
      return await models.ProductReview.find(query)
        .skip(skip || 0)
        .limit(limit || 0)
        .sort(sort)
        .lean();
    }),
    aggregate: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return await models.ProductReview.aggregate(input);
    }),
    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return await models.ProductReview.countDocuments(input);
    }),
    getProductReviews: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { productId, customerId, productIds, ...paginationArgs } = input;
        const filter: any = {};
        if (customerId) {
          filter.customerId = customerId;
        }
        if (productIds) {
          filter.productId = { $in: productIds };
        }
        if (productId) {
          filter.productId = productId;
        }
        return await cursorPaginate({
          model: models.ProductReview,
          query: filter,
          params: paginationArgs,
        });
      }),
    getProductReviewSummary: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { productId } = input;
        const reviews = await models.ProductReview.find({ productId }).lean();
        if (!reviews.length) {
          return {
            productId,
            average: 0,
            length: 0,
            reviews: [],
          };
        }
        return {
          productId,
          average:
            reviews.reduce((sum, cur) => sum + cur.review, 0) / reviews.length,
          length: reviews.length,
          reviews,
        };
      }),
    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { productId, customerId, review, description, info } = input;
      try {
        const created = await models.ProductReview.createProductReview({
          productId,
          customerId,
          review: review || 0,
          description,
          info,
        });
        return created;
      } catch (error) {
        throw new Error(error.message);
      }
    }),
    update: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id, ...doc } = input;
      try {
        const updated = await models.ProductReview.updateProductReview(_id, {
          ...doc,
          review: doc.review || 0,
        });
        return updated;
      } catch (error) {
        throw new Error(error.message);
      }
    }),
    remove: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id } = input;
      try {
        const removed = await models.ProductReview.removeProductReview(_id);
        return removed;
      } catch (error) {
        throw new Error(error.message);
      }
    }),
  },
  wishlist: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return await models.Wishlist.findOne(input).lean();
    }),
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, skip, limit, sort = {} } = input;
      if (!query) {
        return await models.Wishlist.find(input).lean();
      }
      return await models.Wishlist.find(query)
        .skip(skip || 0)
        .limit(limit || 0)
        .sort(sort)
        .lean();
    }),
    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return await models.Wishlist.find(input).countDocuments();
    }),
    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { productId, customerId } = input;
      try {
        // Check if already exists
        const existing = await models.Wishlist.findOne({
          customerId,
          productId,
        }).lean();
        if (existing) {
          return existing;
        }
        const created = await models.Wishlist.createWishlist({
          productId,
          customerId,
        });
        return created;
      } catch (error) {
        throw new Error(error.message);
      }
    }),
    update: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id, ...doc } = input;
      try {
        const updated = await models.Wishlist.updateWishlist(_id, doc);
        return updated;
      } catch (error) {
        throw new Error(error.message);
      }
    }),
    remove: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id } = input;
      try {
        const removed = await models.Wishlist.removeWishlist(_id);
        return removed;
      } catch (error) {
        throw new Error(error.message);
      }
    }),
  },
  lastViewedItem: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return await models.LastViewedItem.findOne(input).lean();
    }),
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, skip, limit, sort = {} } = input;
      if (!query) {
        return await models.LastViewedItem.find(input).lean();
      }
      return await models.LastViewedItem.find(query)
        .skip(skip || 0)
        .limit(limit || 0)
        .sort(sort)
        .lean();
    }),
    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return await models.LastViewedItem.find(input).countDocuments();
    }),
    getLastViewedItems: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { customerId, limit = 10 } = input;
        const items = await models.LastViewedItem.find({ customerId })
          .sort({ modifiedAt: 1 })
          .limit(limit)
          .lean();
        const productIds = items.map((i) => i.productId);
        const products = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'products',
          action: 'find',
          input: {
            query: { _id: { $in: productIds } },
            limit: productIds.length,
          },
        });
        const productsById: Record<string, any> = {};
        products.forEach((product) => {
          productsById[product._id] = product;
        });
        const result = items
          .filter((i) => productsById[i.productId])
          .map((i) => ({ ...i, product: productsById[i.productId] }));
        return result;
      }),
    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { productId, customerId } = input;
      try {
        const created = await models.LastViewedItem.lastViewedItemAdd({
          productId,
          customerId,
        });
        return created;
      } catch (error) {
        throw new Error(error.message);
      }
    }),
    remove: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id } = input;
      try {
        const removed = await models.LastViewedItem.removeLastViewedItem(_id);
        return removed;
      } catch (error) {
        throw new Error(error.message);
      }
    }),
  },
  address: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return await models.Address.findOne(input).lean();
    }),
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, skip, limit, sort = {} } = input;
      if (!query) {
        return await models.Address.find(input).lean();
      }
      return await models.Address.find(query)
        .skip(skip || 0)
        .limit(limit || 0)
        .sort(sort)
        .lean();
    }),
    aggregate: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return await models.Address.aggregate(input);
    }),
    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return await models.Address.find(input).countDocuments();
    }),
    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      try {
        const address = await models.Address.createAddress(input);
        if (!address) {
          throw new Error('Failed to create address');
        }
        return address;
      } catch (error) {
        throw new Error(error.message);
      }
    }),
    update: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id, ...doc } = input;
      try {
        const address = await models.Address.updateAddress(_id, doc);
        if (!address) {
          throw new Error('Address not found');
        }
        return address;
      } catch (error) {
        throw new Error(error.message);
      }
    }),
    remove: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id } = input;
      try {
        const address = await models.Address.removeAddress(_id);
        if (!address) {
          throw new Error('Address not found');
        }
        return address;
      } catch (error) {
        throw new Error(error.message);
      }
    }),
  },
});
export const fetchProducts = async (
  subdomain: string,
  productIds: string[],
) => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'products',
    action: 'find',
    input: {
      query: { _id: { $in: productIds } },
      limit: productIds.length,
    },
    defaultValue: [],
  });
};
