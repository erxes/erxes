import {
  MAIL_AUTOMATED_REPLY_LIMIT,
  MAIL_AUTOMATED_REPLY_WINDOW_MS,
  MAIL_MESSAGE_TYPES,
} from '@/integrations/mail/constants';
import { assertMailAutomationDeliverySucceeded } from '@/integrations/mail/meta/automation/deliveryStatus';
import {
  resolveMailReplyContext,
  TMailActionParams,
} from '@/integrations/mail/meta/automation/replyContext';
import { isUnattendedAddress } from '@/integrations/mail/utils/autoReply';
import { isDuplicateKeyError } from '@/integrations/mail/utils/mongoErrors';

export const actionSendMailMessage = async (params: TMailActionParams) => {
  const reply = await resolveMailReplyContext(params, 'Send Email');
  const { target, recipient } = reply;

  if (target.senderMismatch) {
    throw new Error(
      'Send Email does not answer an unverified sender automatically; use Draft Email Reply so a teammate reviews it first',
    );
  }

  if (isUnattendedAddress(recipient)) {
    throw new Error(
      `Send Email does not answer ${recipient}, an address nobody reads`,
    );
  }

  const recentAutomatedReplies =
    await params.models.MailMessages.countDocuments({
      inboxConversationId: target.conversationId,
      type: MAIL_MESSAGE_TYPES.SENT,
      automated: true,
      createdAt: {
        $gte: new Date(Date.now() - MAIL_AUTOMATED_REPLY_WINDOW_MS),
      },
    });

  if (recentAutomatedReplies >= MAIL_AUTOMATED_REPLY_LIMIT) {
    throw new Error(
      `Send Email paused: this conversation already received ${recentAutomatedReplies} automatic replies in the last hour`,
    );
  }

  const sent = await params.models.MailMessages.createSendMail(
    {
      integrationId: target.integrationId,
      conversationId: target.conversationId,
      customerId: target.customerId,
      subject: reply.subject,
      body: reply.body,
      to: [recipient],
      replyToMessageId: reply.replyToMessageId,
      references: reply.references,
      shouldResolve: reply.shouldResolve,
      automated: true,
      sourceMessageId: target._id,
    },
    params.subdomain,
  ).catch((e) => {
    if (isDuplicateKeyError(e, 'sourceMessageId')) {
      throw new Error(
        'Send Email skipped: this mail already received an automatic reply',
      );
    }

    throw e;
  });

  assertMailAutomationDeliverySucceeded(sent);

  return {
    result: {
      messageId: sent.messageId,
      subject: sent.subject,
      conversationId: sent.inboxConversationId,
      deliveryStatus: sent.deliveryStatus,
    },
  };
};
