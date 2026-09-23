import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';
import {
  sendReply,
  sendReaction,
  generateAttachmentMessages,
} from '@/integrations/instagram/utils';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';
import { debugError } from '@/integrations/instagram/debuggers';
import {
  appendContentImages,
  getErrorMessage,
  sanitizeMessageHtml,
} from '@/integrations/instagram/messageUtils';

interface IMsg {
  action: string;
  payload: string;
  type: string;
}

type TInstagramAttachment = { type: string; url: string };

type TInstagramRelayDoc = {
  internal?: boolean;
  integrationId: string;
  conversationId: string;
  messageId: string;
  mid: string;
  content?: string;
  attachments?: TInstagramAttachment[];
  userId: string;
  reaction: string;
  remove?: boolean;
  replyToMessageId?: string;
  extraInfo?: {
    tag?: string;
    forwardedFrom?: { conversationId: string; messageId: string };
    forwardedNote?: string;
    forwardedSnapshot?: Record<string, unknown>;
  };
};

const INSTAGRAM_MESSAGE_REACTION = 'love';
const UNSUPPORTED_REACTION_KINDS = new Set([
  'story_mention',
  'story_reply',
  'share',
  'deleted',
  'unsupported',
]);

/** Sends a customer-message reaction and persists the accepted result. */
export const handleInstagramReaction = async (
  models: IModels,
  doc: Pick<
    TInstagramRelayDoc,
    'integrationId' | 'conversationId' | 'messageId' | 'remove' | 'userId'
  >,
) => {
  const { integrationId, conversationId, messageId, remove, userId } =
    doc;
  const conversation = await models.InstagramConversations.findOne({
    erxesApiId: conversationId,
  });
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const target = await models.InstagramConversationMessages.findOne({
    conversationId: conversation._id,
    mid: messageId,
  });
  if (!target) {
    throw new Error('Message not found in this Instagram conversation');
  }
  if (target.userId || target.fromBot) {
    throw new Error(
      'Instagram only allows reactions to messages received from the customer',
    );
  }
  if (UNSUPPORTED_REACTION_KINDS.has(target.messageKind || '')) {
    throw new Error(
      'Instagram does not support reactions for this message type',
    );
  }

  await sendReaction(
    models,
    {
      recipient: { id: conversation.senderId },
      sender_action: remove ? 'unreact' : 'react',
      payload: {
        message_id: messageId,
        ...(!remove && { reaction: INSTAGRAM_MESSAGE_REACTION }),
      },
    },
    integrationId,
  );

  const reactions = (target.reactions || []).filter(
    (item) => item.senderId !== userId,
  );
  if (!remove) {
    reactions.push({
      senderId: userId,
      reaction: INSTAGRAM_MESSAGE_REACTION,
    });
  }
  target.reactions = reactions;
  await target.save();

  return { status: 'success', data: target.toObject() };
};

/** Sends a reply in an Instagram post-comment conversation. */
const handleInstagramPostReply = async (
  models: IModels,
  doc: TInstagramRelayDoc,
  subdomain: string,
) => {
  const { conversationId, content = '', attachments = [], userId } = doc;
  const commentConversation = await models.InstagramCommentConversation.findOne(
    {
      erxesApiId: conversationId,
    },
  );
  if (!commentConversation) {
    throw new Error('Comment not found');
  }
  if (!commentConversation.comment_id) {
    throw new Error('Missing Instagram comment_id');
  }

  const post = await models.InstagramPostConversations.findOne({
    postId: commentConversation.postId,
  });
  if (!post) {
    throw new Error('Post not found');
  }

  const strippedContent = sanitizeMessageHtml(content).replace(/&amp;/g, '&');
  if (!strippedContent && attachments.length === 0) {
    throw new Error('Message content is empty');
  }

  try {
    const inboxConversation = await models.Conversations.findOne({
      _id: conversationId,
    });
    if (!inboxConversation) {
      throw new Error('Conversation not found');
    }

    await sendReply(
      models,
      `${commentConversation.comment_id}/replies`,
      { message: strippedContent },
      inboxConversation.integrationId,
    );
    await models.InstagramCommentConversationReply.create({
      recipientId: commentConversation.recipientId,
      senderId: commentConversation.senderId,
      attachments: [],
      userId,
      createdAt: new Date(),
      content: strippedContent,
      parentId: commentConversation.comment_id,
    });

    const user = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: { _id: userId },
    });
    if (user?._id) {
      await sendNotifications(subdomain, {
        user,
        conversations: [inboxConversation],
        type: 'conversationStateChange',
        mobile: true,
        messageContent: strippedContent,
      });
    }

    return { status: 'success' };
  } catch (error) {
    const message = getErrorMessage(error);
    debugError(`Instagram comment reply error: ${message}`);
    throw new Error(message);
  }
};

/** Sends and stores an Instagram direct-message reply. */
const handleInstagramMessengerReply = async (
  models: IModels,
  doc: TInstagramRelayDoc,
  subdomain: string,
) => {
  const {
    integrationId,
    conversationId,
    content = '',
    attachments = [],
    extraInfo,
    replyToMessageId,
  } = doc;
  const tag = extraInfo?.tag || '';
  appendContentImages(content, attachments);
  const providerContent = extraInfo?.forwardedFrom
    ? content.split(/\r?\n/).filter((line) => line !== '↪ Forwarded').join('\n').trim()
    : content;
  const strippedContent = sanitizeMessageHtml(providerContent);
  const forwardedData = extraInfo?.forwardedFrom
    ? {
        forwardedFrom: extraInfo.forwardedFrom,
        forwardedNote: extraInfo.forwardedNote,
        forwardedSnapshot: extraInfo.forwardedSnapshot,
      }
    : undefined;
  const conversation = await models.InstagramConversations.findOne({
    erxesApiId: conversationId,
  });
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  let localMessage;
  try {
    if (strippedContent) {
      const response = await sendReply(
        models,
        'me/messages',
        {
          recipient: { id: conversation.senderId },
          message: { text: strippedContent },
          ...(replyToMessageId && { reply_to: { mid: replyToMessageId } }),
          messaging_type: tag ? 'MESSAGE_TAG' : 'RESPONSE',
          ...(tag && { tag }),
        },
        integrationId,
      );
      if (response) {
        const messageDoc = {
          ...doc,
          content: providerContent,
          ...(forwardedData ? { extraData: forwardedData } : {}),
          conversationId: conversation._id,
          integrationId: conversation.integrationId,
          mid: response.message_id,
          ...(replyToMessageId && {
            replyTo: { messageId: replyToMessageId },
          }),
        };
        localMessage = await models.InstagramConversationMessages.addMessage(
          messageDoc,
          doc.userId,
        );
      }
    }

    for (const message of generateAttachmentMessages(subdomain, attachments)) {
      const response = await sendReply(
        models,
        'me/messages',
        {
          recipient: { id: conversation.senderId },
          message,
          ...(replyToMessageId && { reply_to: { mid: replyToMessageId } }),
          messaging_type: tag ? 'MESSAGE_TAG' : 'RESPONSE',
          ...(tag && { tag }),
        },
        integrationId,
      );
      if (response) {
        const messageDoc = {
          ...doc,
          content: providerContent,
          ...(forwardedData ? { extraData: forwardedData } : {}),
          conversationId: conversation._id,
          integrationId: conversation.integrationId,
          mid: response.message_id,
          ...(replyToMessageId && {
            replyTo: { messageId: replyToMessageId },
          }),
        };
        localMessage = await models.InstagramConversationMessages.addMessage(
          messageDoc,
          doc.userId,
        );
      }
    }
  } catch (error) {
    if (localMessage) {
      await models.InstagramConversationMessages.deleteOne({
        _id: localMessage._id,
      });
    }
    throw new Error(getErrorMessage(error));
  }

  if (!localMessage) {
    throw new Error('Failed to send message: no response from Instagram API');
  }

  return {
    status: 'success',
    data: { ...localMessage.toObject(), conversationId },
  };
};

/** Routes an Instagram relay action to its delivery handler. */
export const handleInstagramMessage = (
  models: IModels,
  msg: IMsg,
  subdomain: string,
) => {
  const { action, payload } = msg;
  const doc: TInstagramRelayDoc = JSON.parse(payload || '{}');

  if (doc.internal) {
    return models.ConversationMessages.addMessage(doc, doc.userId);
  }
  if (action === 'react-messenger') {
    return handleInstagramReaction(models, doc);
  }
  if (action === 'reply-post') {
    return handleInstagramPostReply(models, doc, subdomain);
  }
  if (action === 'reply-messenger') {
    return handleInstagramMessengerReply(models, doc, subdomain);
  }

  throw new Error(`Unknown Instagram message action: ${action}`);
};
