import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { FrontlineTRPCContext } from '~/init-trpc';
import { getConversationFormSubmissions } from '@/form/utils';

const t = initTRPC.context<FrontlineTRPCContext>().create();

export const formTrpcRouter = t.router({
  form: t.router({
    submissionsByConversation: t.procedure
      .input(z.object({ conversationId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { conversationId } = input;

        return getConversationFormSubmissions(models, conversationId);
      }),

    tag: t.procedure
      .input(
        z.discriminatedUnion('action', [
          z.object({
            action: z.literal('count'),
            _ids: z.array(z.string()),
          }),
          z.object({
            action: z.literal('tagObject'),
            tagIds: z.array(z.string()),
            targetIds: z.array(z.string()),
          }),
        ]),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        if (input.action === 'count') {
          return models.Forms.countDocuments({ tagIds: { $in: input._ids } });
        }

        await models.Forms.updateMany(
          { _id: { $in: input.targetIds } },
          { $set: { tagIds: input.tagIds } },
        );

        return models.Forms.find({ _id: { $in: input.targetIds } }).lean();
      }),
  }),
});
