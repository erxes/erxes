import { stripHtml } from 'string-strip-html';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  sendReply,
  sendReaction,
  generateAttachmentMessages,
} from '@/integrations/facebook/utils';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';
import { debugError } from '@/integrations/facebook/debuggers';

type TFacebookAttachment = { type: string; url: string };

type TFacebookRelayDoc = {
  internal?: boolean;
  integrationId: string;
  conversationId: string;
  messageId: string;
  mid: string;
  content?: string;
  attachments?: TFacebookAttachment[];
  userId: string;
  reaction: string;
  remove?: boolean;
  replyToMessageId?: string;
  extraInfo?: { tag?: string };
};

type TFacebookRelayMessage = { action: string; payload: string };

const FACEBOOK_REACTION_EMOJI: Record<string, string> = {
  love: '❤️',
  like: '👍',
  wow: '😮',
  haha: '😂',
  sad: '😢',
  angry: '😠',
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const sanitizeAndFormat = (html: string): string => {
  const normalized = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|blockquote)>/gi, '\n');
  return stripHtml(normalized).result.trim();
};

const handleInternalMessage = async (
  models: IModels,
  doc: TFacebookRelayDoc,
) => {
  const conversation = await models.FacebookConversations.getConversation({
    erxesApiId: doc.conversationId,
  });

  return models.FacebookConversationMessages.addMessage(
    {
      ...doc,
      conversationId: conversation._id,
      content: doc.content || '',
    },
    doc.userId,
  );
};

const handleFacebookReaction = async (
  models: IModels,
  doc: TFacebookRelayDoc,
) => {
  const { integrationId, conversationId, messageId, reaction, remove, userId } =
    doc;
  const conversation = await models.FacebookConversations.getConversation({
    erxesApiId: conversationId,
  });
  const target = await models.FacebookConversationMessages.findOne({
    conversationId: conversation._id,
    mid: messageId,
  });

  if (!target) {
    throw new Error('Message not found in this Facebook conversation');
  }

  const emoji = FACEBOOK_REACTION_EMOJI[reaction];
  if (!remove && !emoji) {
    throw new Error('Unsupported Facebook reaction');
  }

  await sendReaction(
    models,
    {
      recipient: { id: conversation.senderId },
      sender_action: remove ? 'unreact' : 'react',
      payload: {
        message_id: messageId,
        ...(!remove && { reaction: emoji }),
      },
    },
    conversation.recipientId,
    integrationId || '',
  );

  const reactions = (target.reactions || []).filter(
    (item) => item.senderId !== userId,
  );
  if (!remove) {
    reactions.push({ senderId: userId, reaction, emoji });
  }
  target.reactions = reactions;
  await target.save();

  return { status: 'success', data: target.toObject() };
};

const handleFacebookPostReply = async (
  models: IModels,
  doc: TFacebookRelayDoc,
  subdomain: string,
) => {
  const { conversationId, content = '', attachments = [], userId } = doc;
  const commentConversation = await models.FacebookCommentConversation.findOne({
    erxesApiId: conversationId,
  });

  if (!commentConversation) {
    throw new Error('Comment not found');
  }

  const post = await models.FacebookPostConversations.findOne({
    $or: [
      { erxesApiId: conversationId },
      { postId: commentConversation.postId || '' },
    ],
  });
  if (!post) {
    throw new Error('Post not found');
  }

  const strippedContent = stripHtml(content)
    .result.trim()
    .replace(/&amp;/g, '&');
  await models.FacebookCommentConversationReply.create({
    recipientId: commentConversation.recipientId,
    senderId: commentConversation.senderId,
    attachments,
    userId,
    createdAt: new Date(),
    content: strippedContent,
    parentId: commentConversation.comment_id,
  });

  const id = commentConversation.comment_id || post.postId;
  const data = {
    message: commentConversation.comment_id
      ? ` @[${commentConversation.senderId}] ${strippedContent}`
      : strippedContent,
    attachment_url: attachments[0]?.url,
  };

  try {
    const inboxConversation = await models.Conversations.findOne({
      _id: conversationId,
    });
    if (!inboxConversation) {
      throw new Error('Conversation not found');
    }

    await sendReply(
      models,
      `${id}/comments`,
      data,
      commentConversation.recipientId,
      inboxConversation.integrationId,
    );
    const user = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: { _id: userId },
    });
    if (!user?._id) {
      throw new Error('User not found');
    }

    sendNotifications(subdomain, {
      user,
      conversations: [inboxConversation],
      type: 'conversationStateChange',
      mobile: true,
      messageContent: strippedContent,
    });
    return { status: 'success' };
  } catch (error) {
    const message = getErrorMessage(error);
    debugError(`Error replying to post comment: ${message}`);
    throw new Error(message);
  }
};

const appendContentImages = (
  content: string,
  attachments: TFacebookAttachment[],
) => {
  const images = (content.match(/<img[^>]* src="([^"]*)"/g) || [])
    .map((image) => image.match(/src="([^"]*)"/)?.[1])
    .filter((image): image is string => Boolean(image));
  images.forEach((image) => attachments.push({ type: 'image', url: image }));
};

const getReplyTo = async (
  models: IModels,
  conversationId: string,
  replyToMessageId?: string,
) => {
  if (!replyToMessageId) {
    return undefined;
  }

  const repliedToMessage = await models.FacebookConversationMessages.findOne({
    conversationId,
    mid: replyToMessageId,
  }).lean();
  let authorName;
  if (repliedToMessage?.userId) authorName = 'Staff';
  else if (repliedToMessage?.customerId) authorName = 'Customer';

  return {
    messageId: replyToMessageId,
    content: repliedToMessage?.content || 'Original message unavailable',
    authorName,
  };
};

const handleFacebookMessengerReply = async (
  models: IModels,
  doc: TFacebookRelayDoc,
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
  const trimmedTag = (extraInfo?.tag || '').trim();
  const messagingParams: { messaging_type: string; tag?: string } = {
    messaging_type: trimmedTag ? 'MESSAGE_TAG' : 'RESPONSE',
  };
  if (trimmedTag) {
    messagingParams.tag = trimmedTag;
  }

  appendContentImages(content, attachments);
  const strippedContent = sanitizeAndFormat(content);
  const conversation = await models.FacebookConversations.getConversation({
    erxesApiId: conversationId,
  });
  const replyTo = await getReplyTo(models, conversation._id, replyToMessageId);
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
          ...messagingParams,
        },
        conversation.recipientId,
        integrationId,
      );
      if (response) {
        const messageDoc = {
          ...doc,
          content,
          conversationId: conversation._id,
          mid: response.message_id,
          ...(replyTo && { replyTo }),
        };
        localMessage = await models.FacebookConversationMessages.addMessage(
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
          ...messagingParams,
        },
        conversation.recipientId,
        integrationId,
      );
      if (response) {
        const messageDoc = {
          ...doc,
          content,
          conversationId: conversation._id,
          mid: response.message_id,
          ...(replyTo && { replyTo }),
        };
        localMessage = await models.FacebookConversationMessages.addMessage(
          messageDoc,
          doc.userId,
        );
      }
    }
  } catch (error) {
    if (localMessage) {
      await models.FacebookConversationMessages.deleteOne({
        _id: localMessage._id,
      });
    }
    throw new Error(getErrorMessage(error));
  }

  return {
    status: 'success',
    data: { ...localMessage.toObject(), conversationId },
  };
};

export const handleFacebookMessage = (
  models: IModels,
  msg: TFacebookRelayMessage,
  subdomain: string,
) => {
  const { action, payload } = msg;
  const doc: TFacebookRelayDoc = JSON.parse(payload || '{}');

  if (doc.internal) {
    return handleInternalMessage(models, doc);
  }
  if (action === 'react-messenger') {
    return handleFacebookReaction(models, doc);
  }
  if (action === 'reply-post') {
    return handleFacebookPostReply(models, doc, subdomain);
  }
  if (action === 'reply-messenger') {
    return handleFacebookMessengerReply(models, doc, subdomain);
  }
};
