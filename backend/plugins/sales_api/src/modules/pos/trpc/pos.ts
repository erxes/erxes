import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
// import { PosTRPCContext } from '~/init-trpc';
import { IModels } from '~/connectionResolvers';
import {
  getBranchesUtil,
  statusToDone,
  syncOrderFromClient,
} from '~/modules/pos/utils';
// const t = initTRPC.context<PosTRPCContext>().create();
export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

export const posTrpcRouter = t.router({
  pos: t.router({
    orders: t.router({
      updateOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
        const { selector, modifier } = input;
        const { models } = ctx;

        return {
          status: 'success',
          data: await models.PosOrders.updateOne(selector, modifier),
        };
      }),
    }),

    confirm: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Pos.find(query).lean();
    }),
    ecommerceGetBranches: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { subdomain, models } = ctx;
        const { posToken } = query;
        return await getBranchesUtil(subdomain, models, posToken);
      }),
    ordersDeliveryInfo: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { orderId } = input;
        const { models } = ctx;
        const order = await models.PosOrders.findOne({ _id: orderId }).lean();

        if (!order) {
          throw new Error(`PosOrder ${orderId} not found`);
        }

        // on kitchen
        if (!order.deliveryInfo) {
          return {
            status: 'success',
            data: {
              error: 'Deleted delivery information.',
            },
          };
        }

        if (!order.deliveryInfo.dealId) {
          return {
            status: 'success',
            data: {
              _id: order._id,
              status: 'onKitchen',
              date: order.paidDate,
              description: order.description,
            },
          };
        }

        const dealId = order.deliveryInfo.dealId;
        const deal = await models.Deals.findOne({ _id: dealId }).lean();

        if (!deal) {
          return {
            status: 'success',
            data: {
              error: 'Deleted delivery information.',
            },
          };
        }
        const stage = await models.Stages.findOne({ _id: deal.stageId });
        if (!stage) {
          return {
            status: 'success',
            data: {
              error: 'Deleted Deal Stage delivery information.',
            },
          };
        }
        return {
          status: 'success',
          data: {
            _id: order._id,
            status: stage.name,
            date: deal.stageChangedDate || deal.updatedAt || deal.createdAt,
            description: order.description,
          },
        };
      }),
    createOrUpdateOrders: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        const { action, posToken, responses, order, items } = input;
        const pos = await models.Pos.findOne({ token: posToken }).lean();

        if (!pos) {
          throw new Error(`Pos token=${posToken} not found`);
        }

        // ====== if (action === 'statusToDone')
        // if (doneOrder.type === 'delivery' && doneOrder.status === 'done') { }
        if (action === 'statusToDone') {
          return await statusToDone({ subdomain, models, order, pos });
        }

        // ====== if (action === 'makePayment')
        await syncOrderFromClient({
          subdomain,
          models,
          order,
          items,
          pos,
          posToken,
          responses,
        });

        return {
          status: 'success',
        };
      }),
    createOrUpdateOrdersMany: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        const { posToken, syncOrders } = input;
        const pos = await models.Pos.findOne({ token: posToken }).lean();

        if (!pos) {
          throw new Error(`Pos token=${posToken} not found`);
        }

        for (const perData of syncOrders) {
          const { responses, order, items } = perData;
          try {
            await syncOrderFromClient({
              subdomain,
              models,
              order,
              items,
              pos,
              posToken,
              responses,
            });
          } catch (e) {
            console.log(
              `createOrUpdateOrdersMany per warning: ${e.message}, #${order?.number}`,
            );
          }
        }

        return {
          status: 'success',
        };
      }),
  }),
});
