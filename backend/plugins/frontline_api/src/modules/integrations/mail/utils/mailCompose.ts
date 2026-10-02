import { createHash } from 'node:crypto';
import type { IModels } from '~/connectionResolvers';
import type {
  IMailComposeArgs,
  TMailConversationStatusOnSent,
} from '@/integrations/mail/@types/message';
import type { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import {
  MAIL_DELIVERY_STATUSES,
  MAIL_MESSAGE_TYPES,
} from '@/integrations/mail/constants';
import { mailScopeId } from '@/integrations/mail/utils/scope';
import { buildMessageId } from '@/integrations/mail/utils/transports';

const toAddresses = (emails: string[] = []) =>
  emails.map((address) => ({ name: address, address }));

export const composeMailMessage = async (
  models: IModels,
  subdomain: string,
  integration: IMailIntegrationDocument,
  args: IMailComposeArgs,
  thread: {
    inboxConversationId?: string;
    ticketId?: string;
    replyTag: string;
    conversationStatusOnSent?: TMailConversationStatusOnSent;
    draftId?: string;
    sourceMessageId?: string;
  },
) => {
  const {
    customerId,
    subject,
    body,
    reactionEmoji,
    to,
    cc,
    bcc,
    attachments,
    replyToMessageId,
    references,
    automated,
  } = args;
  const scopeId = mailScopeId(integration);
  const [primaryEmail] = to;

  if (!customerId && primaryEmail) {
    await models.MailCustomers.findOrCreate(
      subdomain,
      primaryEmail.trim().toLowerCase(),
      scopeId,
    );
  }

  const fromAddress = integration.address;
  const senderName =
    await models.MailIntegrations.resolveSenderName(integration);
  const referenceChain = [
    ...new Set(
      [
        ...(references ?? []),
        ...(replyToMessageId ? [replyToMessageId] : []),
      ].filter(Boolean),
    ),
  ];
  // The existing _id index arbitrates concurrent reactions without a new index.
  const reactionId =
    reactionEmoji && thread.inboxConversationId && replyToMessageId
      ? `reaction-${createHash('sha256')
          .update(
            JSON.stringify([
              scopeId,
              thread.inboxConversationId,
              replyToMessageId,
              reactionEmoji,
            ]),
          )
          .digest('hex')}`
      : undefined;

  return models.MailMessages.create({
    ...thread,
    ...(reactionId ? { _id: reactionId } : {}),
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
    automated: Boolean(automated),
    reactionEmoji,
    type: MAIL_MESSAGE_TYPES.SENT,
    deliveryStatus: MAIL_DELIVERY_STATUSES.PENDING,
    deliveryAttemptedAt: new Date(),
    createdAt: new Date(),
  });
};
