import { stripHtml } from 'string-strip-html';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  sendReply,
  generateAttachmentMessages,
} from '@/integrations/facebook/utils';
import { sendNotifications } from '~/modules/inbox/graphql/resolvers/mutations/conversations';

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

    return models.ConversationMessages.addMessage(
      {
        ...doc,
        conversationId: conversation._id,
      },
      doc.userId,
    );
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
    let data = {
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
        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'findOne',
        input: { _id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Send notification about the reply to relevant users/devices
      sendNotifications({
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
    } = doc;

    const tag = extraInfo?.tag || '';

    // Extract image URLs from the content
    const images = (content.match(/<img[^>]* src="([^"]*)"/g) || []).map(
      (img) => img.match(/src="([^"]*)"/)[1],
    );
    images.forEach((img) => attachments.push({ type: 'image', url: img }));

    // Strip HTML tags and format the content
    function sanitizeAndFormat(html: string): string {
      let prev;
      let output = html;
      do {
        prev = output;
        output = output.replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '');
      } while (output !== prev);

      return output.trim();
    }

    const strippedContent = sanitizeAndFormat(content);

    const conversation = await models.FacebookConversations.getConversation({
      erxesApiId: conversationId,
    });
    const { senderId } = conversation;
    let localMessage;
    try {
      // Send text message if strippedContent is not empty
      if (strippedContent) {
        const resp = await sendReply(
          models,
          'me/messages',
          {
            recipient: { id: senderId },
            message: { text: strippedContent },
            tag,
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
            tag,
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
