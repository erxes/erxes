import { stripHtml } from 'string-strip-html';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  sendReply,
  sendReaction,
  generateAttachmentMessages,
} from '@/integrations/instagram/utils';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';
import { debugError } from '@/integrations/instagram/debuggers';

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
  extraInfo?: { tag?: string };
};

const INSTAGRAM_MESSAGE_REACTION = 'love';
const UNSUPPORTED_REACTION_KINDS = new Set([
  'story_mention',
  'story_reply',
  'share',
  'deleted',
  'unsupported',
]);

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const sanitizeAndFormat = (html: string): string => {
  const normalized = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|blockquote)>/gi, '\n');
  return stripHtml(normalized).result.trim();
};

const handleInstagramReaction = async (
  models: IModels,
  doc: TInstagramRelayDoc,
) => {
  const { integrationId, conversationId, messageId, reaction, remove, userId } =
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
  if (!remove && reaction) {
    reactions.push({
      senderId: userId,
      reaction: INSTAGRAM_MESSAGE_REACTION,
    });
  }
  target.reactions = reactions;
  await target.save();

  return { status: 'success', data: target.toObject() };
};

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

  const strippedContent = stripHtml(content)
    .result.trim()
    .replace(/&amp;/g, '&');
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

const appendContentImages = (
  content: string,
  attachments: TInstagramAttachment[],
) => {
  const images = (content.match(/<img[^>]* src="([^"]*)"/g) || [])
    .map((image) => image.match(/src="([^"]*)"/)?.[1])
    .filter((image): image is string => Boolean(image));
  images.forEach((image) => attachments.push({ type: 'image', url: image }));
};

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
  const strippedContent = sanitizeAndFormat(content);
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
          content,
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
          messaging_type: tag ? 'MESSAGE_TAG' : 'RESPONSE',
          ...(tag && { tag }),
        },
        integrationId,
      );
      if (response) {
        const messageDoc = {
          ...doc,
          content,
          conversationId: conversation._id,
          integrationId: conversation.integrationId,
          mid: response.message_id,
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
};
