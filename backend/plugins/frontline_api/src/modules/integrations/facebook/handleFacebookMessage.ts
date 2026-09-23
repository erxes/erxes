import validator from 'validator';
import { sendFacebookReplyParts } from '@/integrations/facebook/services/sendReplyParts';
import type { FacebookReplyPart } from '@/integrations/facebook/@types/replyDelivery';
import { stripHtml } from 'string-strip-html';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';
import {
  sendReply,
  sendReaction,
  generateAttachmentMessages,
} from '@/integrations/facebook/utils';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';
import { debugError } from '@/integrations/facebook/debuggers';
import {
  appendContentImages,
  getErrorMessage,
  sanitizeMessageHtml,
} from '@/integrations/utils';

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

export const handleFacebookReaction = async (
  models: IModels,
  doc: Pick<
    TFacebookRelayDoc,
    | 'integrationId'
    | 'conversationId'
    | 'messageId'
    | 'reaction'
    | 'remove'
    | 'userId'
  >,
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

  const payload: Parameters<typeof sendReaction>[1] = remove
    ? {
        recipient: { id: conversation.senderId },
        sender_action: 'unreact',
        payload: { message_id: messageId },
      }
    : {
        recipient: { id: conversation.senderId },
        sender_action: 'react',
        payload: { message_id: messageId, reaction: emoji },
      };

  await sendReaction(
    models,
    payload,
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

  const allAttachments = [...attachments];
  appendContentImages(content, allAttachments);
  const uniqueAttachments = allAttachments.filter(
    (attachment, index) =>
      allAttachments.findIndex(({ url }) => url === attachment.url) === index,
  );
  const strippedContent = sanitizeMessageHtml(content);
  const textContent = strippedContent
    ? `<p>${validator.escape(strippedContent).replace(/\n/g, '<br/>')}</p>`
    : '';
  const conversation = await models.FacebookConversations.getConversation({
    erxesApiId: conversationId,
  });
  const replyTo = await getReplyTo(models, conversation._id, replyToMessageId);
  const parts: FacebookReplyPart[] = [
    ...(textContent ? [{ content: textContent, attachments: [] }] : []),
    ...uniqueAttachments.map((attachment) => ({
      content: '',
      attachments: [attachment],
    })),
  ];
  const delivery = await sendFacebookReplyParts(parts, {
    send: async (part) => {
      const message = part.content
        ? { text: strippedContent }
        : generateAttachmentMessages(subdomain, part.attachments)[0];
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
      return response?.message_id || '';
    },
    persist: async (part, mid) => {
      await models.FacebookConversationMessages.addMessage(
        {
          ...doc,
          ...part,
          conversationId: conversation._id,
          mid,
          ...(replyTo && { replyTo }),
        },
        doc.userId,
      );
    },
  });

  return {
    status: 'success',
    data: {
      conversationId,
      content: delivery.textSent ? textContent : '',
      attachments: uniqueAttachments.filter(({ url }) =>
        delivery.sentAttachmentUrls.includes(url),
      ),
      extraData: { facebookDelivery: delivery },
    },
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

  throw new Error(`Unknown Facebook message action: ${action}`);
};
