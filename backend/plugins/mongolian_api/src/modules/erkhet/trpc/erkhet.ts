import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { afterMutationHandlers } from '../afterMutations';
import { afterQueryHandlers } from '../afterQueries';
import {
  getPosPostData,
  loansTransactionToErkhet,
  orderDeleteToErkhet,
} from '../utils';

export type ErkhetTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<ErkhetTRPCContext>().create();

export const erkhetTrpcRouter = t.router({
  erkhet: {
    afterMutation: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { subdomain } = ctx;
        return await afterMutationHandlers(subdomain, input);
      }),

    afterQuery: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { subdomain } = ctx;
      return await afterQueryHandlers(subdomain, input);
    }),

    toOrder: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;

      const { pos, order } = input;

      const syncLogDoc = {
        contentType: 'pos:order',
        createdAt: new Date(),
        createdBy: order.userId,
      };
      const syncLog = await models.SyncLogs.syncLogsAdd({
        ...syncLogDoc,
        contentId: order._id,
        consumeData: order,
        consumeStr: JSON.stringify(order),
      });
      try {
        const postData = await getPosPostData(
          subdomain,
          pos,
          order,
          pos.paymentTypes,
        );

        if (!postData) {
          return {
            status: 'success',
            data: {},
          };
        }

        //   return await sendTRPCMessage(
        //       models,
        //       syncLog,
        //       "rpc_queue:erxes-automation-erkhet",
        //       {
        //         action: "get-response-send-order-info",
        //         isEbarimt: false,
        //         payload: JSON.stringify(postData),
        //         thirdService: true,
        //         isJson: true
        //       }
        //     )

        return {};
      } catch (e) {
        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          { $set: { error: e.message } },
        );

        return { error: e.message };
      }
    }),

    loanTransaction: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { generals, orderId } = input;

        const syncLogDoc = {
          contentType: 'loans:transaction',
          createdAt: new Date(),
        };
        const syncLog = await models.SyncLogs.syncLogsAdd({
          ...syncLogDoc,
          contentId: orderId,
          consumeData: input,
          consumeStr: JSON.stringify(input),
        });

        try {
          const postData = await loansTransactionToErkhet(
            subdomain,
            generals,
            orderId,
          );
          if (!postData) {
            return {
              status: 'success',
              data: {},
            };
          }

          //   return await sendRPCMessage(
          //       models,
          //       syncLog,
          //       "rpc_queue:erxes-automation-erkhet",
          //       {
          //         action: "get-response-send-journal-orders",
          //         isEbarimt: false,
          //         payload: JSON.stringify(postData),
          //         thirdService: true,
          //         isJson: true
          //       }
          //     );

          return {};
        } catch (e) {
          await models.SyncLogs.updateOne(
            { _id: syncLog._id },
            { $set: { error: e.message } },
          );
          return { error: e.message };
        }
      }),

    deleteTransaction: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { generals, orderId } = input;

        const syncLogDoc = {
          contentType: 'loans:transaction',
          createdAt: new Date(),
        };
        const syncLog = await models.SyncLogs.syncLogsAdd({
          ...syncLogDoc,
          contentId: orderId,
          consumeData: input,
          consumeStr: JSON.stringify(input),
        });

        try {
          const postData = await loansTransactionToErkhet(
            subdomain,
            generals,
            orderId,
          );
          if (!postData) {
            return {
              status: 'success',
              data: {},
            };
          }

          // return await sendRPCMessage(
          //     models,
          //     syncLog,
          //     "rpc_queue:erxes-automation-erkhet",
          //     {
          //       action: "get-response-delete-journal-orders",
          //       isEbarimt: false,
          //       payload: JSON.stringify(postData),
          //       thirdService: true,
          //       isJson: true
          //     }
          //   )

          return {};
        } catch (e) {
          await models.SyncLogs.updateOne(
            { _id: syncLog._id },
            { $set: { error: e.message } },
          );
          return { error: e.message };
        }
      }),

    returnOrder: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { subdomain } = ctx;

      const { pos, order } = input;

      return await orderDeleteToErkhet(subdomain, pos, order);
    }),
  },
});
