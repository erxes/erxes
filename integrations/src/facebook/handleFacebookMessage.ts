import { debugFacebook } from '../debuggers';
import { Comments, Conversations, Posts } from './models';
import { generateAttachmentMessages, sendReply } from './utils';

const sendError = message => ({
  status: 'error',
  errorMessage: message
});

const sendSuccess = data => ({
  status: 'success',
  data
});

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
      const response = await sendReply(
        `${id}/comments`,
        data,
        recipientId,
        integrationId
      );
      return sendSuccess({ response });
    } catch (e) {
      return sendError(e);
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
        await sendReply(
          'me/messages',
          { recipient: { id: senderId }, message: { text: content } },
          recipientId,
          integrationId
        );
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
          debugFacebook(`Error while sending attachments: ${e.message}`);
        }
      }

      return sendSuccess({});
    } catch (e) {
      return sendError(e);
    }
  }
};
