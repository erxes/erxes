import { initTRPC } from '@trpc/server';
import { ITRPCContext, sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import {
  getBranchesUtil,
  statusToDone,
  syncOrderFromClient,
} from '~/modules/pos/utils';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

export const posTrpcRouter = t.router({
  pos: t.router({
    create: t.procedure
      .input(
        z.object({
          doc: z.record(z.any()),
          ownerUserId: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { doc, ownerUserId } = input;

        let userId = ownerUserId;

        if (!userId) {
          const owner = (await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'users',
            action: 'findOne',
            input: { query: { isOwner: true } },
            defaultValue: null,
          })) as { _id: string } | null;

          if (!owner?._id) {
            throw new Error(
              `No owner user found in subdomain "${subdomain}" to assign POS to`,
            );
          }

          userId = owner._id;
        }

        return models.Pos.posAdd({ _id: userId }, doc as any);
      }),
    confirmCover: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { cover } = input;
        await models.Covers.updateOne(
          { _id: cover._id },
          { ...cover },
          { upsert: true },
        );

        return await models.Covers.findOne({ _id: cover._id });
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
            _id: order._id,
            status: 'onKitchen',
            date: order.paidDate,
            description: order.description,
          };
        }

        const dealId = order.deliveryInfo.dealId;
        const deal = await models.Deals.findOne({ _id: dealId }).lean();

        if (!deal) {
          return {
            error: 'Deleted delivery information.',
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
          _id: order._id,
          status: stage.name,
          date: deal.stageChangedDate || deal.updatedAt || deal.createdAt,
          description: order.description,
        };
      }),
    createOrUpdateOrders: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
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
      .mutation(async ({ ctx, input }) => {
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
  order: t.router({
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;

      return await models.PosOrders.findOne(input || {}).lean();
    }),
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, skip, limit, sort = {} } = input || {};

      if (!query) {
        return await models.PosOrders.find(input || {}).lean();
      }

      return await models.PosOrders.find(query)
        .skip(skip || 0)
        .limit(limit || 0)
        .sort(sort)
        .lean();
    }),
    updateOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { selector, modifier } = input;
      const { models } = ctx;

      return await models.PosOrders.updateOrder(selector, modifier);
    }),
  }),
});
