import type { IModels } from '~/connectionResolvers';
import type { Activity } from '@/integrations/facebook/@types/utils';
import type { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import type { IFacebookConversationDocument } from '@/integrations/facebook/@types/conversations';
import type { IFacebookConversationMessageDocument } from '@/integrations/facebook/@types/conversationMessages';
import type { IFacebookBotDocument } from '@/integrations/facebook/db/definitions/bots';
import { debugFacebook } from '@/integrations/facebook/debuggers';
import {
  publishFacebookMessage,
  replaceSenderReaction,
} from '@/integrations/facebook/services/messageEvents';
import { getSharedAttachmentName } from '@/integrations/facebook/services/messagePreview';
import {
  DEFAULT_HANDOFF_MESSAGE,
  sendMessengerBotText,
} from '@/integrations/facebook/services/messengerSend';
import { getErrorMessage, sanitizeString } from '@/integrations/utils';
import { receiveInboxMessage } from '@/inbox/receiveMessage';

export const handleHumanHandoff = async ({
  models,
  subdomain,
  conversation,
  conversationMessage,
  integration,
  bot,
}: {
  models: IModels;
  subdomain: string;
  conversation: IFacebookConversationDocument;
  conversationMessage: IFacebookConversationMessageDocument;
  integration: IFacebookIntegrationDocument;
  bot: IFacebookBotDocument;
}) => {
  if (!conversation.erxesApiId) {
    return;
  }

  const pauseMinutes = Math.max(1, Number(bot.handoffPauseMinutes || 10));
  const pausedUntil = new Date(Date.now() + pauseMinutes * 60 * 1000);
  const inboxConversation = await models.Conversations.findOne({
    _id: conversation.erxesApiId,
  }).lean();

  if (inboxConversation?.automatedReplyControl?.status !== 'human_active') {
    await receiveInboxMessage(subdomain, {
      action: 'set-automated-reply-control',
      payload: JSON.stringify({
        conversationId: conversation.erxesApiId,
        status: 'handoff_requested',
        pausedUntil,
        reason: 'customer_requested',
      }),
    });
  }

  await sendMessengerBotText({
    models,
    subdomain,
    integrationId: integration.erxesApiId,
    facebookConversation: conversation,
    conversationErxesApiId: conversation.erxesApiId,
    bot,
    text: bot.handoffMessage || DEFAULT_HANDOFF_MESSAGE,
    fallbackMid: `handoff-${conversationMessage._id}`,
  });
};

export const handleReaction = async (
  models: IModels,
  userId: string,
  pageId: string,
  reaction: Activity['channelData']['reaction'],
) => {
  if (!reaction?.mid || !reaction.action) {
    return false;
  }

  const conversation = await models.FacebookConversations.findOne({
    senderId: userId,
    recipientId: pageId,
  });

  if (!conversation?.erxesApiId) {
    debugFacebook('Ignoring reaction for an unknown conversation');
    return true;
  }

  const target = await models.FacebookConversationMessages.findOne({
    conversationId: conversation._id,
    mid: sanitizeString(reaction.mid),
  });

  if (!target) {
    debugFacebook('Ignoring reaction for an unknown message');
    return true;
  }

  const normalizedReaction = sanitizeString(
    reaction.reaction || reaction.emoji,
  );
  if (reaction.action === 'react' && !normalizedReaction) {
    debugFacebook('Ignoring reaction without a value');
    return true;
  }

  target.reactions = replaceSenderReaction(
    target.reactions,
    userId,
    reaction.action === 'react'
      ? {
          senderId: userId,
          reaction: normalizedReaction,
          emoji: sanitizeString(reaction.emoji) || undefined,
        }
      : undefined,
  );
  await target.save();

  await publishFacebookMessage(conversation.erxesApiId, target.toObject());
  return true;
};

export const upsertFacebookConversation = async ({
  models,
  integration,
  senderId,
  recipientId,
  timestamp,
  content,
  botId,
}: {
  models: IModels;
  integration: IFacebookIntegrationDocument;
  senderId: string;
  recipientId: string;
  timestamp: Date;
  content?: string;
  botId?: string;
}) => {
  let conversation = await models.FacebookConversations.findOne({
    senderId: { $eq: senderId },
    recipientId: { $eq: recipientId },
  });

  if (!conversation) {
    try {
      conversation = await models.FacebookConversations.create({
        timestamp,
        senderId,
        recipientId,
        content,
        integrationId: integration._id,
        isBot: Boolean(botId),
        botId,
      });
    } catch (e) {
      const message = getErrorMessage(e);
      throw new Error(
        message.includes('duplicate')
          ? 'Concurrent request: conversation duplication'
          : message,
      );
    }
  } else {
    if (botId && (await models.FacebookBots.exists({ _id: botId }))) {
      conversation.botId = botId;
    }
    conversation.content = content || '';
  }

  return conversation;
};

export const formatAttachments = (
  attachments: NonNullable<Activity['channelData']['message']>['attachments'],
) => {
  const stickerAttachment = (attachments || []).find(
    (attachment) =>
      Boolean(attachment.payload?.sticker_id) &&
      Boolean(attachment.payload?.url),
  );
  const attachmentsToFormat = stickerAttachment
    ? [{ ...stickerAttachment, type: 'sticker' }]
    : attachments || [];
  const seenAttachmentUrls = new Set<string>();

  return attachmentsToFormat
    .map((att) => ({
      type: att.type === 'fallback' ? 'share' : att.type,
      url: att.payload?.url || '',
      name:
        att.payload?.title ||
        (att.type === 'fallback'
          ? getSharedAttachmentName(att.payload?.url)
          : undefined),
    }))
    .filter((attachment) => {
      if (attachment.url && seenAttachmentUrls.has(attachment.url)) {
        return false;
      }
      if (attachment.url) seenAttachmentUrls.add(attachment.url);
      return true;
    });
};

export const syncInboxConversation = async ({
  models,
  subdomain,
  customerId,
  integrationId,
  content,
  attachments,
  conversation,
  timestamp,
}: {
  models: IModels;
  subdomain: string;
  customerId?: string;
  integrationId: string;
  content: string;
  attachments: ReturnType<typeof formatAttachments>;
  conversation: IFacebookConversationDocument;
  timestamp: Date;
}) => {
  try {
    const response = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId,
        integrationId,
        content,
        attachments,
        conversationId: conversation.erxesApiId,
        updatedAt: timestamp,
      }),
    });

    if (response.status !== 'success') {
      throw new Error(
        `Conversation creation failed: ${JSON.stringify(response)}`,
      );
    }

    conversation.erxesApiId = response.data._id;
    await conversation.save();
  } catch (e) {
    await models.FacebookConversations.deleteOne({ _id: conversation._id });
    throw new Error(getErrorMessage(e));
  }
};
