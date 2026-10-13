import { initTRPC } from '@trpc/server';
import { ExpectedError, sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IContext } from '~/connectionResolvers';
import { FrontlineTRPCContext } from '~/init-trpc';
import { assertMailConversationAccess } from '@/integrations/mail/utils/access';

const t = initTRPC.context<FrontlineTRPCContext>().create();

export const mailTrpcRouter = t.router({
  mail: t.router({
    canViewConversation: t.procedure
      .input(
        z.object({
          conversationId: z.string().min(1),
          userId: z.string().min(1),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        const user: IContext['user'] | null = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'users',
          action: 'findOne',
          input: { query: { _id: input.userId, isActive: { $ne: false } } },
          defaultValue: null,
        });

        if (!user?._id) {
          return false;
        }

        try {
          await assertMailConversationAccess({
            models,
            subdomain,
            user,
            conversationId: input.conversationId,
          });
        } catch (e) {
          if (e instanceof ExpectedError) {
            return false;
          }

          throw e;
        }

        return true;
      }),
  }),
});
