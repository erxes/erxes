import { graphqlPubsub } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';
import type {
  IMailMessageDocument,
  TMailConversationStatusOnSent,
} from '@/integrations/mail/@types/message';
import {
  MAIL_CONVERSATION_STATUSES_ON_SENT,
  MAIL_DELIVERY_STATUSES,
  MAIL_MESSAGE_TYPES,
} from '@/integrations/mail/constants';

export const awaitsConversationStatus = (message: IMailMessageDocument) =>
  message.deliveryStatus === MAIL_DELIVERY_STATUSES.SENT &&
  Boolean(message.conversationStatusOnSent) &&
  !message.conversationStatusAppliedAt;

export const toConversationStatusOnSent = (
  shouldResolve?: boolean,
  shouldOpen?: boolean,
): TMailConversationStatusOnSent | undefined => {
  if (shouldResolve) {
    return MAIL_CONVERSATION_STATUSES_ON_SENT.CLOSED;
  }

  return shouldOpen ? MAIL_CONVERSATION_STATUSES_ON_SENT.NEW : undefined;
};

const receivedNewerMail = async (
  models: IModels,
  message: IMailMessageDocument,
) => {
  const answered = message.sourceMessageId
    ? await models.MailMessages.findOne(
        { _id: message.sourceMessageId },
        { createdAt: 1 },
      ).lean()
    : null;

  return models.MailMessages.exists({
    inboxConversationId: message.inboxConversationId,
    type: MAIL_MESSAGE_TYPES.INBOX,
    createdAt: { $gt: answered?.createdAt ?? message.createdAt },
  });
};

export const settleConversationStatus = async (
  models: IModels,
  message: IMailMessageDocument,
) => {
  const conversationId = message.inboxConversationId;
  const status = message.conversationStatusOnSent;

  if (!status) {
    return;
  }

  if (conversationId) {
    const closing = status === MAIL_CONVERSATION_STATUSES_ON_SENT.CLOSED;

    if (!closing || !(await receivedNewerMail(models, message))) {
      await models.Conversations.updateConversation(conversationId, {
        status,
        ...(closing ? { closedAt: new Date() } : {}),
      });

      await graphqlPubsub.publish(`conversationChanged:${conversationId}`, {
        conversationChanged: { conversationId, type: status },
      });
    }
  }

  await models.MailMessages.updateOne(
    { _id: message._id },
    { $set: { conversationStatusAppliedAt: new Date() } },
  );
};
