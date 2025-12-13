import { initTRPC } from '@trpc/server';
import { ITRPCContext, sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';

export type EcommerceTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<EcommerceTRPCContext>().create();

export const ecommerceTrpcRouter = t.router({
  productReview: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: 'success',
        data: await models.ProductReview.findOne(input).lean(),
      };
    }),

    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, skip, limit, sort = {} } = input;

      if (!query) {
        return {
          status: 'success',
          data: await models.ProductReview.find(input).lean(),
        };
      }

      return {
        status: 'success',
        data: await models.ProductReview.find(query)
          .skip(skip || 0)
          .limit(limit || 0)
          .sort(sort)
          .lean(),
      };
    }),

    aggregate: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: 'success',
        data: await models.ProductReview.aggregate(input),
      };
    }),

    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: 'success',
        data: await models.ProductReview.find(input).countDocuments(),
      };
    }),

    getProductReviews: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
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

      return {
        status: 'success',
        data: await cursorPaginate({
          model: models.ProductReview,
          query: filter,
          params: paginationArgs,
        }),
      };
    }),

    getProductReviewSummary: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { productId } = input;
      
      const reviews = await models.ProductReview.find({ productId }).lean();
      
      if (!reviews.length) {
        return {
          status: 'success',
          data: {
            productId,
            average: 0,
            length: 0,
            reviews: [],
          },
        };
      }

      return {
        status: 'success',
        data: {
          productId,
          average: reviews.reduce((sum, cur) => sum + cur.review, 0) / reviews.length,
          length: reviews.length,
          reviews,
        },
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

        return {
          status: 'success',
          data: created,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
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

        return {
          status: 'success',
          data: updated,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
      }
    }),

    remove: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id } = input;

      try {
        const removed = await models.ProductReview.removeProductReview(_id);
        return {
          status: 'success',
          data: removed,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
      }
    }),
  },

  wishlist: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: 'success',
        data: await models.Wishlist.findOne(input).lean(),
      };
    }),

    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, skip, limit, sort = {} } = input;

      if (!query) {
        return {
          status: 'success',
          data: await models.Wishlist.find(input).lean(),
        };
      }

      return {
        status: 'success',
        data: await models.Wishlist.find(query)
          .skip(skip || 0)
          .limit(limit || 0)
          .sort(sort)
          .lean(),
      };
    }),

    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: 'success',
        data: await models.Wishlist.find(input).countDocuments(),
      };
    }),

    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { productId, customerId } = input;

      try {
        // Check if already exists
        const existing = await models.Wishlist.findOne({ customerId, productId }).lean();
        if (existing) {
          return {
            status: 'success',
            data: existing,
          };
        }

        const created = await models.Wishlist.createWishlist({
          productId,
          customerId,
        });

        return {
          status: 'success',
          data: created,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
      }
    }),

    update: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id, ...doc } = input;

      try {
        const updated = await models.Wishlist.updateWishlist(_id, doc);
        return {
          status: 'success',
          data: updated,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
      }
    }),

    remove: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id } = input;

      try {
        const removed = await models.Wishlist.removeWishlist(_id);
        return {
          status: 'success',
          data: removed,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
      }
    }),
  },

  lastViewedItem: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: 'success',
        data: await models.LastViewedItem.findOne(input).lean(),
      };
    }),

    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, skip, limit, sort = {} } = input;

      if (!query) {
        return {
          status: 'success',
          data: await models.LastViewedItem.find(input).lean(),
        };
      }

      return {
        status: 'success',
        data: await models.LastViewedItem.find(query)
          .skip(skip || 0)
          .limit(limit || 0)
          .sort(sort)
          .lean(),
      };
    }),

    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: 'success',
        data: await models.LastViewedItem.find(input).countDocuments(),
      };
    }),

    getLastViewedItems: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      const { customerId, limit = 10 } = input;

      const items = await models.LastViewedItem.find({ customerId })
        .sort({ modifiedAt: 1 })
        .limit(limit)
        .lean();

      const productIds = items.map(i => i.productId);

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
      products.forEach(product => {
        productsById[product._id] = product;
      });

      const result = items
        .filter(i => productsById[i.productId])
        .map(i => ({ ...i, product: productsById[i.productId] }));

      return {
        status: 'success',
        data: result,
      };
    }),

    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { productId, customerId } = input;

      try {
        const created = await models.LastViewedItem.lastViewedItemAdd({
          productId,
          customerId,
        });

        return {
          status: 'success',
          data: created,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
      }
    }),

    remove: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id } = input;

      try {
        const removed = await models.LastViewedItem.removeLastViewedItem(_id);
        return {
          status: 'success',
          data: removed,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
      }
    }),
  },

  address: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: 'success',
        data: await models.Address.findOne(input).lean(),
      };
    }),

    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, skip, limit, sort = {} } = input;

      if (!query) {
        return {
          status: 'success',
          data: await models.Address.find(input).lean(),
        };
      }

      return {
        status: 'success',
        data: await models.Address.find(query)
          .skip(skip || 0)
          .limit(limit || 0)
          .sort(sort)
          .lean(),
      };
    }),

    aggregate: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: 'success',
        data: await models.Address.aggregate(input),
      };
    }),

    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: 'success',
        data: await models.Address.find(input).countDocuments(),
      };
    }),

    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;

      try {
        const address = await models.Address.createAddress(input);

        if (!address) {
          return {
            status: 'error',
            errorMessage: 'Failed to create address',
          };
        }

        return {
          status: 'success',
          data: address,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
      }
    }),

    update: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id, ...doc } = input;

      try {
        const address = await models.Address.updateAddress(_id, doc);

        if (!address) {
          return {
            status: 'error',
            errorMessage: 'Address not found',
          };
        }

        return {
          status: 'success',
          data: address,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
      }
    }),

    remove: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id } = input;

      try {
        const address = await models.Address.removeAddress(_id);

        if (!address) {
          return {
            status: 'error',
            errorMessage: 'Address not found',
          };
        }

        return {
          status: 'success',
          data: address,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message,
        };
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