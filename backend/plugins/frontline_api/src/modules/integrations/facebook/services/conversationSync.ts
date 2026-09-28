import type { IModels } from '~/connectionResolvers';
import type { Activity } from '@/integrations/facebook/@types/utils';
import type { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import type { IFacebookConversationDocument } from '@/integrations/facebook/@types/conversations';
import type { IFacebookConversationMessageDocument } from '@/integrations/facebook/@types/conversationMessages';
import type { IFacebookBotDocument } from '@/integrations/facebook/db/definitions/bots';
import { debugFacebook } from '@/integrations/facebook/debuggers';
import { getSharedAttachmentName } from '@/integrations/facebook/services/messagePreview';
import { sendReply } from '@/integrations/facebook/utils';
import { getErrorMessage } from '@/integrations/utils';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { graphqlPubsub } from 'erxes-api-shared/utils';

export const sanitizeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }
  return '';
};

const DEFAULT_HANDOFF_MESSAGE =
  'A teammate will take over shortly. Automated replies are paused.';

const buildMessengerTextPayload = ({
  senderId,
  text,
  tag,
}: {
  senderId: string;
  text: string;
  tag?: string;
}) => {
  const trimmedTag = tag?.trim();
  const payload: {
    recipient: { id: string };
    message: { text: string };
    messaging_type: string;
    tag?: string;
  } = {
    recipient: { id: senderId },
    message: { text },
    messaging_type: trimmedTag ? 'MESSAGE_TAG' : 'RESPONSE',
  };

  if (trimmedTag) {
    payload.tag = trimmedTag;
  }

  return payload;
};

export const handleHumanHandoff = async ({
  models,
  subdomain,
  conversation,
  conversationMessage,
  integration,
  bot,
  senderId,
  recipientId,
}: {
  models: IModels;
  subdomain: string;
  conversation: IFacebookConversationDocument;
  conversationMessage: IFacebookConversationMessageDocument;
  integration: IFacebookIntegrationDocument;
  bot: IFacebookBotDocument;
  senderId: string;
  recipientId: string;
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

  const text = bot.handoffMessage || DEFAULT_HANDOFF_MESSAGE;

  const sendHandoffReply = (tag?: string) =>
    sendReply(
      models,
      'me/messages',
      buildMessengerTextPayload({
        senderId,
        text,
        tag,
      }),
      recipientId,
      integration.erxesApiId,
    );

  let sendResult;

  try {
    sendResult = await sendHandoffReply();
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const shouldRetryWithTag =
      errorMessage.includes('outside of allowed window') && bot.tag;

    if (!shouldRetryWithTag) {
      throw new Error(errorMessage);
    }

    sendResult = await sendHandoffReply(bot.tag);
  }

  await models.FacebookConversationMessages.addBotMessage(subdomain, {
    conversationId: conversation._id,
    botId: bot._id,
    botData: [{ type: 'text', text }],
    mid: String(
      sendResult?.mid ||
        sendResult?.message_id ||
        `handoff-${conversationMessage._id}`,
    ),
    conversationErxesApiId: conversation.erxesApiId,
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

  const reactions = (target.reactions || []).filter(
    (item) => item.senderId !== userId,
  );
  if (reaction.action === 'react') {
    reactions.push({ senderId: userId, reaction: normalizedReaction });
  }
  target.reactions = reactions;
  await target.save();

  await graphqlPubsub.publish(
    `conversationMessageInserted:${conversation.erxesApiId}`,
    {
      conversationMessageInserted: {
        ...target.toObject(),
        conversationId: conversation.erxesApiId,
      },
    },
  );
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
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation duplication'
          : e,
      );
    }
  } else {
    const bot = await models.FacebookBots.findOne({ _id: botId });
    if (bot) {
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
    throw new Error(e);
  }
};
