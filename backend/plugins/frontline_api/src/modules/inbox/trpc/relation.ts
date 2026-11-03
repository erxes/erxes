import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { FrontlineTRPCContext } from '~/init-trpc';
import { logConversationFormSubmission } from '@/inbox/utils/conversationFormSubmission';

const t = initTRPC.context<FrontlineTRPCContext>().create();

const relationEntitySchema = z.object({
  contentType: z.string(),
  contentId: z.string(),
});

export const relationTrpcRouter = t.router({
  relation: t.router({
    onRelationAdded: t.procedure
      .input(
        z.object({
          ownEntity: relationEntitySchema,
          otherEntity: relationEntitySchema,
          userId: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { ownEntity, otherEntity, userId } = input;

        if (ownEntity.contentType !== 'frontline:conversation') {
          return { handled: false };
        }

        return {
          handled: await logConversationFormSubmission({
            models,
            subdomain,
            conversationId: ownEntity.contentId,
            target: otherEntity,
            userId,
          }),
        };
      }),
  }),
});
