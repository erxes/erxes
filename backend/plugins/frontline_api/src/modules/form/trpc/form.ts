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
  }),
});
