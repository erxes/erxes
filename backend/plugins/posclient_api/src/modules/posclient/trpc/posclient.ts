import { initTRPC } from '@trpc/server';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { PosTRPCContext } from '~/init-trpc';
import { ordersAdd } from '~/modules/posclient/graphql/resolvers/mutations/orders';
import { updateMobileAmount } from '~/modules/posclient/utils';
import {
  importProducts,
  importSlots,
  preImportProducts,
  receivePosConfig,
  receiveProduct,
  receiveProductCategory,
  receiveUser,
} from '~/modules/posclient/utils/syncUtils';

const t = initTRPC.context<PosTRPCContext>().create();

export const posclientTrpcRouter = t.router({
  posclient: t.router({
    configs: t.router({
      manage: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
        const { data } = input;
        const { models, subdomain } = ctx;
        return {
          status: 'success',
          data: await receivePosConfig(subdomain, models, data),
        };
      }),
    }),
    covers: t.router({
      remove: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        const { cover } = input;
        await models.Covers.updateOne(
          { _id: cover._id },
          { $set: { status: 'reconf' } },
        );
        return {
          status: 'success',
          data: await models.Covers.findOne({ _id: cover._id }),
        };
      }),
    }),

    health_check: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { channelToken } = input;
      const { models } = ctx;
      if (channelToken) {
        return {
          status: 'success',
          data: { healthy: 'ok' },
        };
      }

      const conf = await models.Configs.findOne({ token: channelToken });

      if (!conf) {
        return {
          status: 'success',
          data: { healthy: 'no' },
        };
      }

      return {
        status: 'success',
        data: { healthy: 'ok' },
      };
    }),
    crudData: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      const { token, type } = input;

      if (type) {
        switch (type) {
          case 'product':
            await receiveProduct(models, input);
            break;
          case 'productCategory':
            await receiveProductCategory(models, input);
            break;
          case 'user':
            await receiveUser(models, input);
            break;
          case 'productGroups':
            const { productGroups = [] } = input;
            await preImportProducts(models, token, productGroups);
            await importProducts(subdomain, models, token, productGroups);
            break;
          case 'slots':
            const { slots = [] } = input;
            await importSlots(models, slots, token);
            break;
          default:
            break;
        }
      }
    }),
    updateSynced: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;

      const { responseIds, orderId, convertDealId } = input;

      await models.Orders.updateOne(
        { _id: orderId },
        { $set: { synced: true, convertDealId } },
      );
      await models.PutResponses.updateMany(
        { _id: { $in: responseIds } },
        { $set: { synced: true } },
      );
    }),
    erxes_posclient_to_pos_api: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        const { order } = input;

        await models.Orders.updateOne(
          { _id: order._id },
          { $set: { ...order, modifiedAt: new Date() } },
          { upsert: true },
        );

        const bulkOps: any[] = [];

        for (const item of order.items) {
          bulkOps.push({
            updateOne: {
              filter: { _id: item._id },
              update: {
                $set: {
                  ...item,
                  orderId: order._id,
                },
              },
              upsert: true,
            },
          });
        }
        if (bulkOps.length) {
          await models.OrderItems.bulkWrite(bulkOps);
        }

        await graphqlPubsub.publish('ordersOrdered', {
          ordersOrdered: {
            ...(await models.Orders.findOne({ _id: order._id }).lean()),
            _id: order._id,
            status: order.status,
            customerId: order.customerId,
            customerType: order.customerType,
          },
        });
      }),
    erxes_posclient_to_pos_api_remove: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        const { order } = input;

        await models.Orders.deleteOne({
          _id: order._id,
          posToken: order.posToken,
          subToken: order.subToken,
        });
      }),
    paymentCallbackClient: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        const { status } = input;
        if (status !== 'paid') {
          return;
        }

        await updateMobileAmount(subdomain, models, [input]);
      }),
    createOrder: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      const { order = {} } = input || {};

      const { posToken } = order;

      const config = await models.Configs.findOne({ token: posToken });

      if (!config) {
        return {
          status: 'error',
          errorMessage: 'Cannot find pos user or config',
        };
      }

      return {
        status: 'success',
        data: await ordersAdd(order, {
          subdomain,
          models,
          config,
        }),
      };
    }),
  }),
});
