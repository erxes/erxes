import * as strip from 'strip';

import { IModels } from './connectionResolver';
import { generateAttachmentMessages, sendReply } from './utils';
import { sendInboxMessage } from './messageBroker';
import { sendCoreMessage } from './messageBroker';
/**
 * Handle requests from erxes api
 */

export const handleInstagramMessage = async (
  models: IModels,
  msg,
  subdomain
) => {
  const { action, payload } = msg;
  const doc = JSON.parse(payload || '{}');
  if (doc.internal) {
    const conversation = await models.Conversations.getConversation({
      erxesApiId: doc.conversationId
    });

    return models.ConversationMessages.addMessage(
      {
        ...doc,
        conversationId: conversation._id
      },
      doc.userId
    );
  }
  if (action === 'reply-post') {
    const {
      integrationId,
      conversationId,
      content = '',
      attachments = [],
      extraInfo,
      userId
    } = doc;
    const commentConversationResult = await models.CommentConversation.findOne({
      erxesApiId: conversationId
    });

    const post = await models.PostConversations.findOne({
      $or: [
        { erxesApiId: conversationId },
        {
          postId: commentConversationResult
            ? commentConversationResult.postId
            : ''
        }
      ]
    });
    if (!commentConversationResult) {
      throw new Error('comment not found');
    }
    if (!post) {
      throw new Error('Post not found');
    }
    let strippedContent = strip(content);

    strippedContent = strippedContent.replace(/&amp;/g, '&');

    const { recipientId, comment_id, senderId } = commentConversationResult;
    await models.CommentConversationReply.create({
      recipientId: recipientId,
      senderId: senderId,
      attachments: attachments,
      userId: userId,
      createdAt: new Date(Date.now()),
      content: strippedContent,
      parentId: comment_id
    });

    let attachment_url = undefined;
    if (doc.attachments && doc.attachments.length > 0) {
      attachment_url = doc.attachments[0].url;
    }

    let data = {
      message: strippedContent,
      attachment_url: attachment_url || undefined
    };
    const id = commentConversationResult
      ? commentConversationResult.comment_id
      : post.postId;
    if (commentConversationResult && commentConversationResult.comment_id) {
      data = {
        message: ` ${strippedContent}`,
        attachment_url: attachment_url
      };
    }
    try {
      const inboxConversation = await sendInboxMessage({
        isRPC: true,
        subdomain,
        action: 'conversations.findOne',
        data: { query: { _id: conversationId } }
      });
      await sendReply(
        `${id}/replies`,
        data,
        inboxConversation && inboxConversation.integrationId,
        models
      );

      const user = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: { _id: userId },
        isRPC: true
      });

      if (user) {
        sendInboxMessage({
          action: 'sendNotifications',
          isRPC: false,
          subdomain,
          data: {
            user,
            conversations: [inboxConversation],
            type: 'conversationStateChange',
            mobile: true,
            messageContent: content
          }
        });
        return { status: 'success' };
      } else {
        throw new Error('User not found');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  if (action === 'reply-messenger') {
    const { integrationId, conversationId, content, attachments } = doc;

    const conversation = await models.Conversations.getConversation({
      erxesApiId: conversationId
    });

    let strippedContent = strip(content);

    strippedContent = strippedContent.replace(/&amp;/g, '&');

    const { senderId } = conversation;

    try {
      if (content) {
        try {
          await sendReply(
            'me/messages',
            {
              recipient: { id: senderId },
              message: { text: strippedContent },
              tag: 'HUMAN_AGENT'
            },
            integrationId,
            models
          );

          return { status: 'success' };
        } catch (e) {
          throw new Error(e.message);
        }
      }

      for (const message of generateAttachmentMessages(
        subdomain,
        attachments
      )) {
        try {
          await sendReply(
            'me/messages',
            { recipient: { id: senderId }, message },
            integrationId,
            models
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

  // if (action === 'reply-messenger') {
  //   const {
  //     integrationId,
  //     conversationId,
  //     content = '',
  //     attachments = [],
  //     extraInfo
  //   } = doc;
  //   const tag = extraInfo && extraInfo.tag ? extraInfo.tag : '';

  //   // Extract image URLs from content
  //   const regex = new RegExp('<img[^>]* src="([^"]*)"', 'g');
  //   const images: string[] = (content.match(regex) || []).map((m) =>
  //     m.replace(regex, '$1')
  //   );

  //   images.forEach((img) => {
  //     attachments.push({ type: 'image', url: img });
  //   });

  //   // Clean up content
  //   let strippedContent = strip(content);
  //   strippedContent = strippedContent.replace(/&amp;/g, '&');

  //   let localMessage;
  //   try {
  //     // Get conversation details
  //     const conversation = await models.Conversations.getConversation({
  //       erxesApiId: conversationId
  //     });
  //     const { recipientId, senderId } = conversation;

  //     // Send text reply if there's content
  //     if (strippedContent) {
  //       try {
  //         const resp = await sendReply(
  //           models,
  //           'me/messages',
  //           {
  //             recipient: { id: senderId },
  //             message: { text: strippedContent },
  //             tag
  //           },
  //           recipientId,
  //           integrationId
  //         );

  //         if (resp) {
  //           localMessage = await models.ConversationMessages.addMessage(
  //             {
  //               ...doc,
  //               conversationId: conversation._id,
  //               mid: resp.message_id
  //             },
  //             doc.userId
  //           );
  //         }
  //       } catch (e) {
  //         // Clean up if text reply fails
  //         if (localMessage) {
  //           await models.ConversationMessages.deleteOne({
  //             _id: localMessage._id
  //           });
  //         }
  //         throw new Error(e.message);
  //       }
  //     }

  //     // Send attachment messages
  //     const generatedAttachments = generateAttachmentMessages(
  //       subdomain,
  //       attachments
  //     );
  //     for (const message of generatedAttachments) {
  //       try {
  //         await sendReply(
  //           models,
  //           'me/messages',
  //           { recipient: { id: senderId }, message, tag },
  //           recipientId,
  //           integrationId
  //         );
  //       } catch (e) {
  //         throw new Error(e.message);
  //       }
  //     }
  //   } catch (e) {
  //     // Catch any other errors
  //     throw new Error(e.message);
  //   }

  //   return {
  //     status: 'success',
  //     data: { ...localMessage.toObject(), conversationId }
  //   };
  // }
};
