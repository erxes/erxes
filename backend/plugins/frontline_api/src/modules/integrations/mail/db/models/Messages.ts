import { Model } from 'mongoose';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { mailMessageSchema } from '@/integrations/mail/db/definitions/messages';
import {
  IMailComposeArgs,
  IMailMessageDocument,
  IMailSendArgs,
  IMailTicketMailArgs,
} from '@/integrations/mail/@types/message';
import { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import {
  MAIL_DELIVERY_STATUSES,
  MAIL_MESSAGE_TYPES,
} from '@/integrations/mail/constants';
import { createReplyTag } from '@/integrations/mail/utils/address';
import { mailScopeId } from '@/integrations/mail/utils/scope';
import { describeError } from '@/integrations/mail/utils/errors';
import {
  buildMessageId,
  isRetryableFailure,
  resolveReplyToAddress,
  sendMail,
} from '@/integrations/mail/utils/transports';

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

const toAddresses = (emails: string[] = []) =>
  emails.map((address) => ({ name: address, address }));

export const loadMailMessageClass = (models: IModels) => {
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
        ...compose
      } = args;

      if (!conversationId) {
        throw new Error(
          'A mail reply needs the conversation it belongs to — send it from the inbox thread',
        );
      }

      const integration = await Message.resolveIntegration(
        integrationId,
        conversationId,
      );

      if (shouldResolve) {
        await models.Conversations.updateOne(
          { _id: conversationId },
          { $set: { status: 'closed' } },
        );
      } else if (shouldOpen) {
        await models.Conversations.updateOne(
          { _id: conversationId },
          { $set: { status: 'new' } },
        );
      }

      const message = await Message.compose(subdomain, integration, compose, {
        inboxConversationId: conversationId,
        replyTag: await Message.resolveReplyTag({
          inboxConversationId: conversationId,
        }),
      });

      await models.Conversations.updateConversation(conversationId, {
        content: compose.subject,
        updatedAt: message.createdAt,
      });

      await graphqlPubsub.publish(
        `conversationMessageInserted:${conversationId}`,
        {
          conversationMessageInserted: {
            _id: String(message._id),
            content: message.body ?? '',
            conversationId,
          },
        },
      );

      return Message.deliver(subdomain, message, integration);
    }

    public static async createTicketMail(
      integration: IMailIntegrationDocument,
      args: IMailTicketMailArgs,
      subdomain: string,
    ) {
      const { ticketId, ...compose } = args;

      const message = await Message.compose(subdomain, integration, compose, {
        ticketId,
        replyTag: await Message.resolveReplyTag({ ticketId }),
      });

      return Message.deliver(subdomain, message, integration);
    }

    private static async compose(
      subdomain: string,
      integration: IMailIntegrationDocument,
      args: IMailComposeArgs,
      thread: {
        inboxConversationId?: string;
        ticketId?: string;
        replyTag: string;
      },
    ) {
      const {
        customerId,
        subject,
        body,
        to,
        cc,
        bcc,
        attachments,
        replyToMessageId,
        references,
      } = args;

      const scopeId = mailScopeId(integration);

      await Message.ensureCustomer(subdomain, customerId, to, scopeId);

      const fromAddress = integration.address;

      const senderName = await Message.resolveSenderName(integration);

      const referenceChain = [
        ...new Set(
          [
            ...(references ?? []),
            ...(replyToMessageId ? [replyToMessageId] : []),
          ].filter(Boolean),
        ),
      ];

      return models.MailMessages.create({
        ...thread,
        inboxIntegrationId: scopeId,
        messageId: buildMessageId(fromAddress),
        inReplyTo: replyToMessageId,
        references: referenceChain,
        subject,
        body: body ?? '',
        from: [{ name: senderName || fromAddress, address: fromAddress }],
        to: toAddresses(to),
        cc: toAddresses(cc),
        bcc: toAddresses(bcc),
        attachments: (attachments ?? []).map(
          ({ name, type, size, url, contentId, disposition }) => ({
            filename: name,
            mimeType: type,
            type,
            size,
            url,
            contentId,
            disposition,
          }),
        ),
        type: MAIL_MESSAGE_TYPES.SENT,
        deliveryStatus: MAIL_DELIVERY_STATUSES.PENDING,
        createdAt: new Date(),
      });
    }

    public static async retrySend(_id: string, subdomain: string) {
      const message = await models.MailMessages.findOne({ _id });

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.type !== MAIL_MESSAGE_TYPES.SENT) {
        throw new Error('Only outbound messages can be resent');
      }

      const integration = await models.MailIntegrations.findByScope(
        message.inboxIntegrationId,
      );

      if (!integration) {
        throw new Error('Mail integration not found');
      }

      const claimed = await models.MailMessages.updateOne(
        { _id, deliveryStatus: MAIL_DELIVERY_STATUSES.FAILED },
        {
          $set: { deliveryStatus: MAIL_DELIVERY_STATUSES.PENDING },
          $unset: { deliveryError: '', deliveryRetryable: '' },
        },
      );

      if (!claimed.modifiedCount) {
        throw new Error('Only a failed message can be resent');
      }

      return Message.deliver(subdomain, message, integration);
    }

    private static async deliver(
      subdomain: string,
      message: IMailMessageDocument,
      integration: IMailIntegrationDocument,
    ) {
      const replyToAddress = resolveReplyToAddress(
        integration,
        message.replyTag,
      );

      const senderName = await Message.resolveSenderName(integration);

      const [inReplyTo] = await Message.toWireReferences(
        message.inboxIntegrationId,
        message.inReplyTo ? [message.inReplyTo] : [],
      );

      const references = await Message.toWireReferences(
        message.inboxIntegrationId,
        message.references ?? [],
      );

      try {
        const result = await sendMail(subdomain, {
          messageId: message.messageId,
          from: integration.address,
          fromName: senderName || undefined,
          replyTo: replyToAddress,
          to: message.to.map((entry) => entry.address),
          cc: message.cc.map((entry) => entry.address),
          bcc: message.bcc.map((entry) => entry.address),
          subject: message.subject ?? '',
          html: message.body ?? '',
          inReplyTo,
          references,
          attachments: (message.attachments ?? []).map((attachment) => ({
            name: attachment.filename,
            url: attachment.url,
            type: attachment.type,
            size: attachment.size,
            contentId: attachment.contentId,
            disposition: attachment.disposition,
          })),
        });

        const bounced = result.bounced.length > 0;

        await models.MailMessages.updateOne(
          { _id: message._id },
          bounced
            ? {
                $set: {
                  deliveryStatus: MAIL_DELIVERY_STATUSES.BOUNCED,
                  bouncedRecipients: result.bounced,
                  providerMessageId: result.providerMessageId,
                },
                $unset: { deliveryError: '', deliveryRetryable: '' },
              }
            : {
                $set: {
                  deliveryStatus: MAIL_DELIVERY_STATUSES.SENT,
                  providerMessageId: result.providerMessageId,
                },
                $unset: {
                  bouncedRecipients: '',
                  deliveryError: '',
                  deliveryRetryable: '',
                },
              },
        );

        await models.MailIntegrations.markHealthy(integration._id);
      } catch (e) {
        const deliveryError = describeError(e);

        await models.MailMessages.updateOne(
          { _id: message._id },
          {
            $set: {
              deliveryStatus: MAIL_DELIVERY_STATUSES.FAILED,
              deliveryError,
              deliveryRetryable: isRetryableFailure(e),
            },
          },
        );

        await models.MailIntegrations.markUnhealthy(
          integration._id,
          deliveryError,
        );
      }

      return models.MailMessages.findOne({
        _id: message._id,
      }) as Promise<IMailMessageDocument>;
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

    private static async resolveSenderName(
      integration: IMailIntegrationDocument,
    ) {
      if (integration.senderName) {
        return integration.senderName;
      }

      if (!integration.inboxId) {
        return integration.name ?? '';
      }

      const inbox = await models.Integrations.findOne({
        _id: integration.inboxId,
      });

      return inbox?.name ?? '';
    }

    private static async toWireReferences(
      inboxIntegrationId: string,
      chain: string[],
    ) {
      if (!chain.length) {
        return chain;
      }

      const ours = await models.MailMessages.find(
        {
          inboxIntegrationId,
          type: MAIL_MESSAGE_TYPES.SENT,
          messageId: { $in: chain },
        },
        { messageId: 1, providerMessageId: 1 },
      ).lean();

      if (!ours.length) {
        return chain;
      }

      const onTheWire = new Map<string, string>(
        ours.map((entry) => [entry.messageId, entry.providerMessageId ?? '']),
      );

      return chain
        .map((id) => (onTheWire.has(id) ? (onTheWire.get(id) as string) : id))
        .filter(Boolean);
    }

    private static async resolveIntegration(
      integrationId?: string,
      conversationId?: string,
    ) {
      if (integrationId) {
        const byInbox = await models.MailIntegrations.findOne({
          inboxId: integrationId,
        });

        if (byInbox) {
          return byInbox;
        }
      }

      if (conversationId) {
        const conversation = await models.Conversations.findOne({
          _id: conversationId,
        });

        if (conversation?.integrationId) {
          const byConversation = await models.MailIntegrations.findOne({
            inboxId: conversation.integrationId,
          });

          if (byConversation) {
            return byConversation;
          }
        }
      }

      throw new Error('Mail integration not found');
    }

    private static async ensureCustomer(
      subdomain: string,
      customerId: string | undefined,
      to: string[],
      inboxIntegrationId: string,
    ) {
      const [primaryEmail] = to;

      if (customerId || !primaryEmail) {
        return;
      }

      await models.MailCustomers.findOrCreate(
        subdomain,
        primaryEmail.trim().toLowerCase(),
        inboxIntegrationId,
      );
    }
  }

  mailMessageSchema.loadClass(Message);

  return mailMessageSchema;
};
