import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { FrontlineTRPCContext } from '~/init-trpc';

const t = initTRPC.context<FrontlineTRPCContext>().create();

export const conversationTrpcRouter = t.router({
  conversation: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return models.Conversations.find(query).lean();
    }),
    tag: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;

      const { targetIds, tagIds, action } = input;

      let response = {};

      if (action === 'count') {
        response = await models.Conversations.countDocuments({
          tagIds: { $in: tagIds },
        });
      }

      if (action === 'tagObject') {
        await models.Conversations.updateMany(
          { _id: { $in: targetIds } },
          { $set: { tagIds } },
        );

        response = await models.Conversations.find({
          _id: { $in: targetIds },
        }).lean();

        //   if (type !== 'integration') {
        //     sendCommonMessage({
        //       serviceName: 'automations',
        //       subdomain,
        //       action: 'trigger',
        //       data: {
        //         type: 'inbox:conversation',
        //         targets: [response]
        //       },
        //       isRPC: true,
        //       defaultValue: null
        //     });
        //   }
      }

      return response;
    }),
  }),
});
