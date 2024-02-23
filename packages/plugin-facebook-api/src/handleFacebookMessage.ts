import * as strip from 'strip';

import { IModels } from './connectionResolver';
import { generateAttachmentMessages, sendReply } from './utils';
import { sendInboxMessage } from './messageBroker';

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
    const conversation = await models.Conversations.getConversation({
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
    const {
      integrationId,
      conversationId,
      content = '',
      attachments = [],
      extraInfo,
      userId,
    } = doc;

    let strippedContent = strip(content);

    strippedContent = strippedContent.replace(/&amp;/g, '&');

    const commentConversationResult = await models.CommentConversation.findOne({
      erxesApiId: conversationId,
    });
    const post = await models.PostConversations.findOne({
      $or: [
        { erxesApiId: conversationId },
        {
          postId: commentConversationResult
            ? commentConversationResult.postId
            : '',
        },
      ],
    });

    if (!post) {
      throw new Error('Post not found');
    }
    if (commentConversationResult) {
      const { recipientId, comment_id, senderId } = commentConversationResult;
      await models.CommentConversationReply.create({
        recipientId: recipientId,
        senderId: senderId,
        attachments: attachments,
        userId: userId,
        createdAt: new Date(Date.now()),
        content: strippedContent,
        parentId: comment_id,
      });

      let attachment: {
        url?: string;
        type?: string;
        payload?: { url: string };
      } = {};

      if (attachments && attachments.length > 0) {
        attachment = {
          type: 'file',
          payload: {
            url: attachments[0].url,
          },
        };
      }

      let data = {
        message: strippedContent,
        attachment_url: attachment.payload ? attachment.payload.url : undefined,
      };
      const id = commentConversationResult
        ? commentConversationResult.comment_id
        : post.postId;

      if (commentConversationResult && commentConversationResult.comment_id) {
        data = {
          message: ` @[${commentConversationResult.senderId}] ${strippedContent}`,
          attachment_url: attachment.url,
        };
      }
      try {
        const inboxConversation = await sendInboxMessage({
          isRPC: true,
          subdomain,
          action: 'conversations.findOne',
          data: { query: { _id: conversationId } },
        });
        await sendReply(
          models,
          `${id}/comments`,
          data,
          recipientId,
          inboxConversation && inboxConversation.integrationId,
        );

        sendInboxMessage({
          action: 'sendNotifications',
          isRPC: false,
          subdomain,
          data: {
            userId,
            conversations: [inboxConversation],
            type: 'conversationStateChange',
            mobile: true,
            messageContent: content,
          },
        });

        return { status: 'success' };
      } catch (e) {
        throw new Error(e.message);
      }
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
    const tag = extraInfo && extraInfo.tag ? extraInfo.tag : '';

    const regex = new RegExp('<img[^>]* src="([^"]*)"', 'g');

    const images: string[] = (content.match(regex) || []).map((m) =>
      m.replace(regex, '$1'),
    );

    images.forEach((img) => {
      attachments.push({ type: 'image', url: img });
    });

    let strippedContent = strip(content);

    strippedContent = strippedContent.replace(/&amp;/g, '&');

    const conversation = await models.Conversations.getConversation({
      erxesApiId: conversationId,
    });

    const { recipientId, senderId } = conversation;
    let localMessage;

    try {
      if (strippedContent) {
        try {
          const resp = await sendReply(
            models,
            'me/messages',
            {
              recipient: { id: senderId },
              message: { text: strippedContent },
              tag,
            },
            recipientId,
            integrationId,
          );

          if (resp) {
            localMessage = await models.ConversationMessages.addMessage(
              {
                ...doc,
                // inbox conv id comes, so override
                conversationId: conversation._id,
                mid: resp.message_id,
              },
              doc.userId,
            );
          }
        } catch (e) {
          await models.ConversationMessages.deleteOne({
            _id: localMessage && localMessage._id,
          });

          throw new Error(e.message);
        }
      }

      const generatedAttachments = generateAttachmentMessages(attachments);

      for (const message of generatedAttachments) {
        try {
          await sendReply(
            models,
            'me/messages',
            { recipient: { id: senderId }, message, tag },
            recipientId,
            integrationId,
          );
        } catch (e) {
          throw new Error(e.message);
        }
      }
    } catch (e) {
      throw new Error(e.message);
    }

    return {
      status: 'success',
      // inbox conversation id is used for mutation response,
      // therefore override local id
      data: { ...localMessage.toObject(), conversationId },
    };
  }
};
