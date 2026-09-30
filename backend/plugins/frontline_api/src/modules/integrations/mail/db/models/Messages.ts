import type { Model } from 'mongoose';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';
import { mailMessageSchema } from '@/integrations/mail/db/definitions/messages';
import type {
  IMailMessageDocument,
  IMailSendArgs,
  IMailTicketMailArgs,
} from '@/integrations/mail/@types/message';
import type { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import { createReplyTag } from '@/integrations/mail/utils/address';
import { mailScopeId } from '@/integrations/mail/utils/scope';
import { createMailDelivery } from '@/integrations/mail/utils/mailDelivery';
import { toConversationStatusOnSent } from '@/integrations/mail/utils/mailConversationStatus';
import { composeMailMessage } from '@/integrations/mail/utils/mailCompose';
import { assertCustomerRecipient } from '@/integrations/mail/utils/mailRecipient';

export interface IMailMessageModel extends Model<IMailMessageDocument> {
  findRelatedThread(
    scopeId: string,
    messageId: string,
    inReplyTo?: string,
    references?: string[],
  ): Promise<IMailMessageDocument | null>;
  findByReplyTag(
    scopeId: string,
    tag: string,
  ): Promise<IMailMessageDocument | null>;
  findLatestFromSender(
    scopeId: string,
    address: string,
  ): Promise<IMailMessageDocument | null>;
  createSendMail(
    args: IMailSendArgs,
    subdomain: string,
  ): Promise<IMailMessageDocument>;
  createTicketMail(
    integration: IMailIntegrationDocument,
    args: IMailTicketMailArgs,
    subdomain: string,
  ): Promise<IMailMessageDocument>;
  retrySend(_id: string, subdomain: string): Promise<IMailMessageDocument>;
}

export const loadMailMessageClass = (models: IModels) => {
  const mailDelivery = createMailDelivery(models);

  // skipcq: JS-0327
  class Message {
    public static async findRelatedThread(
      scopeId: string,
      messageId: string,
      inReplyTo?: string,
      references?: string[],
    ) {
      const $or: Record<string, unknown>[] = [
        { references: { $in: [messageId] } },
        { messageId: { $in: references ?? [] } },
        { providerMessageId: { $in: references ?? [] } },
      ];

      if (inReplyTo) {
        $or.push(
          { messageId: inReplyTo },
          { providerMessageId: inReplyTo },
          { references: { $in: [inReplyTo] } },
        );
      }

      return models.MailMessages.findOne({
        inboxIntegrationId: scopeId,
        $or,
      });
    }

    public static async findByReplyTag(scopeId: string, tag: string) {
      return models.MailMessages.findOne({
        inboxIntegrationId: scopeId,
        replyTag: tag,
      });
    }

    public static async findLatestFromSender(scopeId: string, address: string) {
      return models.MailMessages.findOne({
        inboxIntegrationId: scopeId,
        ticketId: { $exists: true, $ne: null },
        'from.address': address,
      }).sort({ createdAt: -1, _id: -1 });
    }

    public static async createSendMail(args: IMailSendArgs, subdomain: string) {
      const {
        integrationId,
        conversationId,
        shouldOpen,
        shouldResolve,
        draftId,
        sourceMessageId,
        ...compose
      } = args;

      const integration = await Message.resolveIntegration(
        integrationId,
        conversationId,
      );

      const scopeId = mailScopeId(integration);

      let targetConversationId = conversationId;
      let effectiveCustomerId = compose.customerId;
      if (!targetConversationId) {
        const [firstRecipient] = compose.to ?? [];

        if (!firstRecipient?.trim()) {
          throw new Error(
            'Starting an email conversation requires a recipient',
          );
        }

        if (effectiveCustomerId) {
          await assertCustomerRecipient(
            subdomain,
            effectiveCustomerId,
            firstRecipient,
          );
        }

        if (!effectiveCustomerId && firstRecipient) {
          effectiveCustomerId = await models.MailCustomers.findOrCreate(
            subdomain,
            firstRecipient.trim().toLowerCase(),
            scopeId,
          );
        }

        if (!effectiveCustomerId) {
          throw new Error('Starting an email conversation requires a customer');
        }

        const conversation = await models.Conversations.createConversation({
          integrationId: integration.inboxId,
          customerId: effectiveCustomerId,
          content: compose.subject,
        });
        targetConversationId = conversation._id;
      }

      const message = await composeMailMessage(
        models,
        subdomain,
        integration,
        {
          ...compose,
          customerId: effectiveCustomerId,
        },
        {
          inboxConversationId: targetConversationId,
          replyTag: await Message.resolveReplyTag({
            inboxConversationId: targetConversationId,
          }),
          conversationStatusOnSent: toConversationStatusOnSent(
            shouldResolve,
            shouldOpen,
          ),
          draftId,
          sourceMessageId,
        },
      );

      await models.Conversations.updateConversation(targetConversationId, {
        content: compose.subject,
        updatedAt: message.createdAt,
      });

      await graphqlPubsub.publish(
        `conversationMessageInserted:${targetConversationId}`,
        {
          conversationMessageInserted: {
            _id: String(message._id),
            content: message.body ?? '',
            conversationId: targetConversationId,
          },
        },
      );

      return mailDelivery.deliver(subdomain, message, integration);
    }

    public static async createTicketMail(
      integration: IMailIntegrationDocument,
      args: IMailTicketMailArgs,
      subdomain: string,
    ) {
      const { ticketId, ...compose } = args;

      const message = await composeMailMessage(
        models,
        subdomain,
        integration,
        compose,
        {
          ticketId,
          replyTag: await Message.resolveReplyTag({ ticketId }),
        },
      );

      return mailDelivery.deliver(subdomain, message, integration);
    }

    public static async retrySend(_id: string, subdomain: string) {
      return mailDelivery.retrySend(_id, subdomain);
    }

    private static async resolveReplyTag(thread: {
      inboxConversationId?: string;
      ticketId?: string;
    }) {
      const tagged = await models.MailMessages.findOne({
        ...thread,
        replyTag: { $exists: true, $ne: null },
      });

      return tagged?.replyTag ?? createReplyTag();
    }

    private static async resolveIntegration(
      integrationId?: string,
      conversationId?: string,
    ) {
      if (conversationId) {
        const conversation = await models.Conversations.findOne({
          _id: conversationId,
        });
        if (
          !conversation?.integrationId ||
          (integrationId && integrationId !== conversation.integrationId)
        ) {
          throw new Error('Mail conversation and sender do not match');
        }
        integrationId = conversation.integrationId;
      }

      if (integrationId) {
        const byInbox = await models.MailIntegrations.findOne({
          inboxId: integrationId,
          disabledAt: null,
        });

        if (byInbox) {
          return byInbox;
        }
      }

      throw new Error('Mail integration not found');
    }
  }

  mailMessageSchema.loadClass(Message);

  return mailMessageSchema;
};
