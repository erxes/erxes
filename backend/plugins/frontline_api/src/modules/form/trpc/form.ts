import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { FrontlineTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/trpc/agentMeta';
import { getConversationFormSubmissions } from '@/form/utils';

const t = initTRPC.context<FrontlineTRPCContext>().create();

export const formTrpcRouter = t.router({
  form: t.router({
    submissionsByConversation: t.procedure
      .meta(
        agentMeta(
          'Get the form submissions attached to an inbox conversation: { conversationId }. Returns { formId, formTitle, submissions: [{ label, value }] }, or null when the conversation has no submission.',
          { module: 'form', action: 'showFormSubmissions' },
        ),
      )
      .input(z.object({ conversationId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { conversationId } = input;

        return getConversationFormSubmissions(models, conversationId);
      }),
  }),
});
