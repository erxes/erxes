import { IModels } from './connectionResolver';
import { generateAttachmentMessages, sendReply } from './utils';

/**
 * Handle requests from erxes api
 */
export const handleFacebookMessage = async (models: IModels, msg) => {
  const { action, payload } = msg;
  const doc = JSON.parse(payload || '{}');

  if (action === 'reply-post') {
    const { integrationId, conversationId, content, attachments } = doc;

    const comment = await models.Comments.findOne({
      commentId: conversationId
    });

    const post = await models.Posts.findOne({
      $or: [
        { erxesApiId: conversationId },
        { postId: comment ? comment.postId : '' }
      ]
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const { recipientId } = post;

    let attachment: {
      url?: string;
      type?: string;
      payload?: { url: string };
    } = {};

    if (attachments && attachments.length > 0) {
      attachment = {
        type: 'file',
        payload: {
          url: attachments[0].url
        }
      };
    }

    let data = {
      message: content,
      attachment_url: attachment.url
    };

    const id = comment ? comment.commentId : post.postId;

    if (comment && comment.commentId) {
      data = {
        message: ` @[${comment.senderId}] ${content}`,
        attachment_url: attachment.url
      };
    }

    try {
      await sendReply(
        models,
        `${id}/comments`,
        data,
        recipientId,
        integrationId
      );

      return { status: 'success' };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  if (action === 'reply-messenger') {
    const { integrationId, conversationId, content, attachments, tag } = doc;

    const conversation = await models.Conversations.getConversation({
      erxesApiId: conversationId
    });

    const { recipientId, senderId } = conversation;
    let localMessage;

    try {
      if (content) {
        try {
          const resp = await sendReply(
            models,
            'me/messages',
            {
              recipient: { id: senderId },
              message: { text: content },
              tag
            },
            recipientId,
            integrationId
          );

          if (resp) {
            localMessage = await models.ConversationMessages.addMessage(
              {
                ...doc,
                // inbox conv id comes, so override
                conversationId: conversation._id,
                mid: resp.message_id
              },
              doc.userId
            );
          }
        } catch (e) {
          await models.ConversationMessages.deleteOne({
            _id: localMessage && localMessage._id
          });

          throw new Error(e.message);
        }
      }

      for (const message of generateAttachmentMessages(attachments)) {
        try {
          await sendReply(
            models,
            'me/messages',
            { recipient: { id: senderId }, message, tag },
            recipientId,
            integrationId
          );
        } catch (e) {
          throw new Error(e.message);
        }
      }
    } catch (e) {
      throw new Error(e.message);
    }

    return { status: 'success' };
  }
};
