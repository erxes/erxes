import { initTRPC } from '@trpc/server';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { FrontlineTRPCContext } from '~/init-trpc';
import { getConversationFormSubmissions } from '@/form/utils';

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

        const conversationId = ownEntity.contentId;
        const formData = await getConversationFormSubmissions(
          models,
          conversationId,
        );

        if (!formData?.submissions?.length) {
          return { handled: false };
        }

        if (otherEntity.contentType === 'frontline:ticket') {
          const ticketId = otherEntity.contentId;
          const alreadyLogged = await models.Activity.findOne({
            contentId: ticketId,
            module: 'FORM_SUBMISSION',
            'metadata.conversationId': conversationId,
          });

          if (alreadyLogged) {
            return { handled: false };
          }

          await models.Activity.createActivity({
            action: 'CREATED',
            contentId: ticketId,
            module: 'FORM_SUBMISSION',
            metadata: {
              conversationId,
              ticketId,
              formId: formData.formId,
              formTitle: formData.formTitle,
              submissions: formData.submissions,
            },
            createdBy: userId || '',
          });

          return { handled: true };
        }

        const [targetPluginName, targetModuleName] =
          otherEntity.contentType.split(':');

        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'activityLog',
          action: 'createActivityLog',
          input: [
            {
              activityType: 'formSubmission',
              sourcePlugin: 'frontline',
              target: { _id: otherEntity.contentId },
              action: {
                type: 'create',
                description: 'logged a form submission',
              },
              changes: {},
              metadata: {
                conversationId,
                formId: formData.formId,
                formTitle: formData.formTitle,
                submissions: formData.submissions,
              },
              pluginName: targetPluginName,
              moduleName: targetModuleName,
              collectionName: targetModuleName,
            },
          ],
          context: { userId },
          defaultValue: null,
        });

        return { handled: true };
      }),
  }),
});
