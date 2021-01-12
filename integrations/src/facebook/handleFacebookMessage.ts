import { Comments, Conversations, Posts } from './models';
import { generateAttachmentMessages, sendReply } from './utils';

/*
 * Handle requests from erxes api
 */
export const handleFacebookMessage = async msg => {
  const { action, payload } = msg;
  const doc = JSON.parse(payload || '{}');

  if (action === 'change-status-comment') {
    const { conversationId } = doc;

    const comment = await Comments.findOne({ commentId: conversationId });

    return Comments.updateOne(
      { commentId: conversationId },
      { $set: { isResolved: comment.isResolved ? false : true } }
    );
  }

  if (action === 'reply-post') {
    const { integrationId, conversationId, content, attachments } = doc;

    const comment = await Comments.findOne({ commentId: conversationId });

    const post = await Posts.findOne({
      $or: [
        { erxesApiId: conversationId },
        { postId: comment ? comment.postId : '' }
      ]
    });

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
      await sendReply(`${id}/comments`, data, recipientId, integrationId);

      return { status: 'success' };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  if (action === 'reply-messenger') {
    const { integrationId, conversationId, content, attachments } = doc;

    const conversation = await Conversations.getConversation({
      erxesApiId: conversationId
    });

    const { recipientId, senderId } = conversation;

    try {
      if (content) {
        try {
          await sendReply(
            'me/messages',
            { recipient: { id: senderId }, message: { text: content } },
            recipientId,
            integrationId
          );

          return { status: 'success' };
        } catch (e) {
          throw new Error(e.message);
        }
      }

      for (const message of generateAttachmentMessages(attachments)) {
        try {
          await sendReply(
            'me/messages',
            { recipient: { id: senderId }, message },
            recipientId,
            integrationId
          );
        } catch (e) {
          throw new Error(e.message);
        }
      }

      return { status: 'success' };
    } catch (e) {
      throw new Error(e.message);
    }
  }
};
