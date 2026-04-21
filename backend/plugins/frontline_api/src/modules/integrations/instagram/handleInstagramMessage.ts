import { stripHtml } from 'string-strip-html';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sendReply, generateAttachmentMessages } from '@/integrations/instagram/utils';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';

export const handleInstagramMessage = async (
  models: IModels,
  msg,
  subdomain,
) => {
  const { action, payload } = msg;
  const doc = JSON.parse(payload || '{}');

  if (doc.internal) {
    const conversation = await models.InstagramConversations.findOne({
      erxesApiId: doc.conversationId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return models.InstagramConversationMessages.addMessage(
      {
        ...doc,
        conversationId: conversation._id,
      },
      doc.userId,
    );
  }

  if (action === 'reply-post') {
    const { conversationId, content = '', attachments = [], userId } = doc;

    const commentConversation = await models.InstagramCommentConversation.findOne({
      erxesApiId: conversationId,
    });

    if (!commentConversation) {
      throw new Error('Comment not found');
    }

    const post = await models.InstagramPostConversations.findOne({
      $or: [
        { erxesApiId: conversationId },
        { postId: commentConversation.postId || '' },
      ],
    });

    if (!post) {
      throw new Error('Post not found');
    }

    let strippedContent = stripHtml(content).result.trim();
    strippedContent = strippedContent.replace(/&amp;/g, '&');

    await models.InstagramCommentConversationReply.create({
      recipientId: commentConversation.recipientId,
      senderId: commentConversation.senderId,
      attachments,
      userId,
      createdAt: new Date(),
      content: strippedContent,
      parentId: commentConversation.comment_id,
    });

    let attachment: { url?: string; type?: string; payload?: { url: string } } = {};
    if (attachments.length > 0) {
      attachment = {
        type: 'file',
        payload: { url: attachments[0].url },
      };
    }

    const id = commentConversation.comment_id || post.postId;
    let data = {
      message: strippedContent,
      attachment_url: attachment.payload ? attachment.payload.url : undefined,
    };

    if (commentConversation.comment_id) {
      data.message = ` @[${commentConversation.senderId}] ${strippedContent}`;
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
        `${id}/comments`,
        data,
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

      if (!user || !user._id) {
        throw new Error('User not found');
      }

      sendNotifications({
        user,
        conversations: [inboxConversation],
        type: 'conversationStateChange',
        mobile: true,
        messageContent: strippedContent,
      });

      return { status: 'success' };
    } catch (e: any) {
      console.error('Error replying to Instagram post comment:', e);
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

    const images = (content.match(/<img[^>]* src="([^"]*)"/g) || []).map(
      (img) => img.match(/src="([^"]*)"/)[1],
    );
    images.forEach((img) => attachments.push({ type: 'image', url: img }));

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

    const conversation = await models.InstagramConversations.findOne({
      erxesApiId: conversationId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const { senderId } = conversation;
    let localMessage;

    try {
      if (strippedContent) {
        const resp = await sendReply(
          models,
          'me/messages',
          {
            recipient: { id: senderId },
            message: { text: strippedContent },
            tag,
          },
          integrationId,
        );

        if (resp) {
          localMessage = await models.InstagramConversationMessages.addMessage(
            {
              ...doc,
              conversationId: conversation._id,
              mid: resp.message_id,
            },
            doc.userId,
          );
        }
      }

      for (const message of generateAttachmentMessages(subdomain, attachments)) {
        const resp = await sendReply(
          models,
          'me/messages',
          {
            recipient: { id: senderId },
            message,
            tag,
          },
          integrationId,
        );

        if (resp) {
          localMessage = await models.InstagramConversationMessages.addMessage(
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
        await models.InstagramConversationMessages.deleteOne({
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
