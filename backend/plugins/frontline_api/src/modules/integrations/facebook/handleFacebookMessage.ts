import { stripHtml } from 'string-strip-html';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  sendReply,
  sendReaction,
  generateAttachmentMessages,
} from '@/integrations/facebook/utils';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';

/**
 * Handle requests from erxes api
 */
export const handleFacebookMessage = async (
  models: IModels,
  msg,
  subdomain,
) => {
  const { action, payload } = msg;
  const doc = JSON.parse(payload || '{}');
  if (doc.internal) {
    const conversation = await models.FacebookConversations.getConversation({
      erxesApiId: doc.conversationId,
    });

    return models.FacebookConversationMessages.addMessage(
      {
        ...doc,
        conversationId: conversation._id,
      },
      doc.userId,
    );
  }
  if (action === 'react-messenger') {
    const {
      integrationId,
      conversationId,
      messageId,
      reaction,
      remove,
      userId,
    } = doc;
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

    const reactionEmoji: Record<string, string> = {
      love: '❤️',
      like: '👍',
      wow: '😮',
      haha: '😂',
      sad: '😢',
      angry: '😠',
    };
    const emoji = reactionEmoji[reaction];

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
      integrationId,
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
  }
  if (action === 'reply-post') {
    const { conversationId, content = '', attachments = [], userId } = doc;

    // Find the comment conversation by erxesApiId
    const commentConversationResult =
      await models.FacebookCommentConversation.findOne({
        erxesApiId: conversationId,
      });

    if (!commentConversationResult) {
      throw new Error('Comment not found');
    }

    // Find the related post conversation either by erxesApiId or postId from commentConversationResult
    const post = await models.FacebookPostConversations.findOne({
      $or: [
        { erxesApiId: conversationId },
        { postId: commentConversationResult.postId || '' },
      ],
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Strip HTML tags from content and decode &amp;
    let strippedContent = stripHtml(content).result.trim();
    strippedContent = strippedContent.replace(/&amp;/g, '&');

    // Create a reply record in DB
    await models.FacebookCommentConversationReply.create({
      recipientId: commentConversationResult.recipientId,
      senderId: commentConversationResult.senderId,
      attachments,
      userId,
      createdAt: new Date(),
      content: strippedContent,
      parentId: commentConversationResult.comment_id,
    });

    // Prepare attachment payload if any attachments present
    let attachment: { url?: string; type?: string; payload?: { url: string } } =
      {};
    if (attachments.length > 0) {
      attachment = {
        type: 'file',
        payload: {
          url: attachments[0].url,
        },
      };
    }

    // Prepare data for sending reply to Facebook
    const id = commentConversationResult.comment_id || post.postId;
    const data = {
      message: strippedContent,
      attachment_url: attachment.payload ? attachment.payload.url : undefined,
    };

    // If this is a reply to a comment, prepend a mention (adjust format as needed)
    if (commentConversationResult.comment_id) {
      data.message = ` @[${commentConversationResult.senderId}] ${strippedContent}`;
    }

    try {
      // Find the inbox conversation for local reference
      const inboxConversation = await models.Conversations.findOne({
        _id: conversationId,
      });

      if (!inboxConversation) {
        throw new Error('Conversation not found');
      }

      // Send the reply via the Facebook API (or relevant integration)
      await sendReply(
        models,
        `${id}/comments`,
        data,
        commentConversationResult.recipientId,
        inboxConversation.integrationId,
      );

      // Fetch the user who sent the reply
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

      // Send notification about the reply to relevant users/devices
      sendNotifications(subdomain, {
        user,
        conversations: [inboxConversation],
        type: 'conversationStateChange',
        mobile: true,
        messageContent: strippedContent,
      });

      return { status: 'success' };
    } catch (e: any) {
      console.error('Error replying to post comment:', e);
      throw new Error(e.message);
    }
  }

  if (action === 'reply-messenger') {
    const {
      integrationId,
      conversationId,
      content = '',
      attachments = [],
      extraInfo,
      replyToMessageId,
    } = doc;

    const tag = extraInfo?.tag || '';

    const trimmedTag = tag.trim();
    const messagingParams: { messaging_type: string; tag?: string } = {
      messaging_type: trimmedTag ? 'MESSAGE_TAG' : 'RESPONSE',
    };
    if (trimmedTag) {
      messagingParams.tag = trimmedTag;
    }

    // Extract image URLs from the content
    const images = (content.match(/<img[^>]* src="([^"]*)"/g) || []).map(
      (img) => img.match(/src="([^"]*)"/)[1],
    );
    images.forEach((img) => attachments.push({ type: 'image', url: img }));

    // Strip HTML tags and format the content
    function sanitizeAndFormat(html: string): string {
      const normalized = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|blockquote)>/gi, '\n');
      return stripHtml(normalized).result.trim();
    }

    const strippedContent = sanitizeAndFormat(content);

    const conversation = await models.FacebookConversations.getConversation({
      erxesApiId: conversationId,
    });
    const { senderId } = conversation;
    let localMessage;

    let replyTo;
    if (replyToMessageId) {
      const repliedToMessage =
        await models.FacebookConversationMessages.findOne({
          conversationId: conversation._id,
          mid: replyToMessageId,
        }).lean();
      let replyAuthorName;
      if (repliedToMessage?.userId) replyAuthorName = 'Staff';
      else if (repliedToMessage?.customerId) replyAuthorName = 'Customer';
      replyTo = {
        messageId: replyToMessageId,
        content:
          repliedToMessage?.content || 'Original message unavailable',
        authorName: replyAuthorName,
      };
    }
    try {
      // Send text message if strippedContent is not empty
      if (strippedContent) {
        const resp = await sendReply(
          models,
          'me/messages',
          {
            recipient: { id: senderId },
            message: { text: strippedContent },
            ...(replyToMessageId && {
              reply_to: { mid: replyToMessageId },
            }),
            ...messagingParams,
          },
          conversation.recipientId,
          integrationId,
        );

        if (resp) {
          localMessage = await models.FacebookConversationMessages.addMessage(
            {
              ...doc,
              conversationId: conversation._id,
              mid: resp.message_id,
              ...(replyTo && { replyTo }),
            },
            doc.userId,
          );
        }
      }

      // Send attachments
      for (const message of generateAttachmentMessages(
        subdomain,
        attachments,
      )) {
        const resp = await sendReply(
          models,
          'me/messages',
          {
            recipient: { id: senderId },
            message,
            ...(replyToMessageId && {
              reply_to: { mid: replyToMessageId },
            }),
            ...messagingParams,
          },
          conversation.recipientId,
          integrationId,
        );

        if (resp) {
          localMessage = await models.FacebookConversationMessages.addMessage(
            {
              ...doc,
              conversationId: conversation._id,
              mid: resp.message_id,
              ...(replyTo && { replyTo }),
            },
            doc.userId,
          );
        }
      }
    } catch (e) {
      if (localMessage) {
        await models.FacebookConversationMessages.deleteOne({
          _id: localMessage._id,
        });
      }
      throw new Error(e.message);
    }

    return {
      status: 'success',
      data: { ...localMessage.toObject(), conversationId },
    };
  }
};
