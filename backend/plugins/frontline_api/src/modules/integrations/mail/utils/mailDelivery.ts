import type { IModels } from '~/connectionResolvers';
import type { IMailMessageDocument } from '@/integrations/mail/@types/message';
import type { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import {
  MAIL_DELIVERY_STATUSES,
  MAIL_MESSAGE_TYPES,
} from '@/integrations/mail/constants';
import {
  awaitsConversationStatus,
  settleConversationStatus,
} from '@/integrations/mail/utils/mailConversationStatus';
import { resendableFilter } from '@/integrations/mail/utils/delivery';
import { describeError } from '@/integrations/mail/utils/errors';
import { debugError } from '@/integrations/mail/debuggers';
import {
  isRetryableFailure,
  resolveReplyToAddress,
  sendMail,
} from '@/integrations/mail/utils/transports';

interface MailDeliveryService {
  retrySend(_id: string, subdomain: string): Promise<IMailMessageDocument>;
  deliver(
    subdomain: string,
    message: IMailMessageDocument,
    integration: IMailIntegrationDocument,
  ): Promise<IMailMessageDocument>;
}

export const createMailDelivery = (models: IModels): MailDeliveryService => {
  const mailDelivery = {
    async retrySend(_id: string, subdomain: string) {
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

      if (awaitsConversationStatus(message)) {
        await settleConversationStatus(models, message);

        return models.MailMessages.findOne({
          _id,
        }) as Promise<IMailMessageDocument>;
      }

      const claimed = await models.MailMessages.updateOne(
        { _id, ...resendableFilter() },
        {
          $set: {
            deliveryStatus: MAIL_DELIVERY_STATUSES.PENDING,
            deliveryAttemptedAt: new Date(),
          },
          $unset: { deliveryError: '', deliveryRetryable: '' },
        },
      );

      if (!claimed.modifiedCount) {
        throw new Error(
          'Only a failed message, or one stuck sending for more than 10 minutes, can be resent',
        );
      }

      return mailDelivery.deliver(subdomain, message, integration);
    },

    async deliver(
      subdomain: string,
      message: IMailMessageDocument,
      integration: IMailIntegrationDocument,
    ) {
      const replyToAddress = resolveReplyToAddress(
        integration,
        message.replyTag,
      );

      const senderName = await models.MailIntegrations.resolveSenderName(
        integration,
      );

      const [inReplyTo] = await mailDelivery.toWireReferences(
        message.inboxIntegrationId,
        message.inReplyTo ? [message.inReplyTo] : [],
      );

      const references = await mailDelivery.toWireReferences(
        message.inboxIntegrationId,
        message.references ?? [],
      );

      let result: Awaited<ReturnType<typeof sendMail>> | undefined;

      try {
        result = await sendMail(subdomain, {
          messageId: message.messageId,
          from: integration.address,
          fromName: senderName || undefined,
          replyTo: replyToAddress,
          to: message.to.map((entry) => entry.address),
          cc: message.cc.map((entry) => entry.address),
          bcc: message.bcc.map((entry) => entry.address),
          subject: message.subject ?? '',
          html: message.body ?? '',
          reactionEmoji: message.reactionEmoji,
          inReplyTo,
          references,
          automated: Boolean(message.automated),
          attachments: (message.attachments ?? []).map((attachment) => ({
            name: attachment.filename,
            url: attachment.url,
            type: attachment.type,
            size: attachment.size,
            contentId: attachment.contentId,
            disposition: attachment.disposition,
          })),
        });
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

        await mailDelivery.settleIntegrationHealth(integration, deliveryError);
      }

      if (result) {
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

        await mailDelivery.settleIntegrationHealth(integration);

        if (!bounced) {
          await settleConversationStatus(models, message).catch((e) =>
            debugError(
              `Mail ${message._id} was delivered but its conversation status was not applied:`,
              e,
            ),
          );
        }
      }

      return models.MailMessages.findOne({
        _id: message._id,
      }) as Promise<IMailMessageDocument>;
    },

    async settleIntegrationHealth(
      integration: IMailIntegrationDocument,
      deliveryError?: string,
    ) {
      try {
        if (deliveryError) {
          await models.MailIntegrations.markUnhealthy(
            integration._id,
            deliveryError,
          );
        } else {
          await models.MailIntegrations.markHealthy(integration._id);
        }
      } catch (e) {
        debugError(
          `Could not record the health of mail integration ${integration._id}:`,
          e,
        );
      }
    },

    async toWireReferences(inboxIntegrationId: string, chain: string[]) {
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
    },
  };

  return mailDelivery;
};
