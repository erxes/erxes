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
} from '@/integrations/utils';
import { replaceSenderReaction } from '@/integrations/instagram/services/messageEvents';
import { z } from 'zod';
import { escape } from 'lodash';
import { normalizeStoredInstagramMessage } from './normalizeMessage';
import type { IInstagramConversationMessage } from './@types/conversationMessages';
import { sendInstagramReplyParts } from './services/sendReplyParts';

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

export const handleInstagramReaction = async (
  models: IModels,
  doc: Pick<
    TInstagramRelayDoc,
    'integrationId' | 'conversationId' | 'messageId' | 'remove' | 'userId'
  >,
) => {
  const { integrationId, conversationId, messageId, remove, userId } = doc;
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

  target.reactions = replaceSenderReaction(
    target.reactions,
    userId,
    remove
      ? undefined
      : { senderId: userId, reaction: INSTAGRAM_MESSAGE_REACTION },
  );
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

    const response: unknown = await sendReply(
      models,
      `${commentConversation.comment_id}/replies`,
      { message: strippedContent },
      inboxConversation.integrationId,
    );
    const { id: commentId } = z
      .object({ id: z.string().min(1) })
      .parse(response);
    const reply = await models.InstagramCommentConversationReply.create({
      comment_id: commentId,
      mid: commentId,
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

    return {
      status: 'success',
      data: {
        ...reply.toObject(),
        conversationId,
        messageKind: 'text',
        providerData: { messageId: commentId },
      },
    };
  } catch (error) {
    const message = getErrorMessage(error);
    debugError(`Instagram comment reply error: ${message}`);
    throw new Error(message);
  }
};

const FORWARDED_MARKER_LINE = '↪ Forwarded';

const stripForwardedMarker = (content: string) =>
  content
    .split(/\r?\n/)
    .filter((line) => line !== FORWARDED_MARKER_LINE)
    .join('\n')
    .trim();

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
    userId,
  } = doc;
  const tag = extraInfo?.tag || '';
  const forwardedFrom = extraInfo?.forwardedFrom;
  const allAttachments = [...attachments];
  appendContentImages(content, allAttachments);
  const uniqueAttachments = allAttachments.filter(
    (attachment, index) =>
      allAttachments.findIndex(({ url }) => url === attachment.url) === index,
  );
  const providerContent = forwardedFrom
    ? stripForwardedMarker(content)
    : content;
  const strippedContent = sanitizeMessageHtml(providerContent);
  const textContent = strippedContent
    ? `<p>${escape(strippedContent).replace(/\n/g, '<br/>')}</p>`
    : '';
  const conversation = await models.InstagramConversations.findOne({
    erxesApiId: conversationId,
  });
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const extraData = {
    ...(forwardedFrom && {
      forwardedFrom,
      forwardedNote: extraInfo?.forwardedNote,
      forwardedSnapshot: extraInfo?.forwardedSnapshot,
    }),
  };
  const acceptedParts: IInstagramConversationMessage[] = [];
  const parts = [
    ...(textContent ? [{ content: textContent, attachments: [] }] : []),
    ...uniqueAttachments.map((attachment) => ({
      content: '',
      attachments: [attachment],
    })),
  ];
  const delivery = await sendInstagramReplyParts(parts, {
    send: async (part) => {
      const message = part.content
        ? { text: strippedContent }
        : generateAttachmentMessages(subdomain, part.attachments)[0];
      const response: unknown = await sendReply(
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
      return z.object({ message_id: z.string().min(1) }).parse(response)
        .message_id;
    },
    persist: async (part, mid) => {
      const message = normalizeStoredInstagramMessage({
        ...part,
        mid,
        conversationId,
        userId,
        createdAt: new Date(),
        extraData,
        ...(replyToMessageId && { replyTo: { messageId: replyToMessageId } }),
      });
      // Keep the acknowledgement for canonical inbox storage, including when
      // the provider copy cannot be saved. Never delete already delivered parts.
      acceptedParts.push(message);
      await models.InstagramConversationMessages.addMessage(
        { ...message, conversationId: conversation._id },
        userId,
      );
    },
  });

  return {
    status: 'success',
    data: {
      conversationId,
      content: delivery.textSent ? textContent : '',
      parts: acceptedParts.map((part) => ({
        ...part,
        extraData: { ...extraData, instagramDelivery: delivery },
      })),
    },
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

  throw new Error(`Unknown Instagram message action: ${action}`);
};
