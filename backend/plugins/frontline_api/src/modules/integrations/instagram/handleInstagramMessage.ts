import { stripHtml } from 'string-strip-html';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  sendReply,
  generateAttachmentMessages,
} from '@/integrations/instagram/utils';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';
import { debugError } from '@/integrations/instagram/debuggers';

interface IMsg {
  action: string;
  payload: string;
  type: string;
}

function sanitizeAndFormat(html: string): string {
  let prev;
  let output = html;
  do {
    prev = output;
    output = output.replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '');
  } while (output !== prev);
  return output.trim();
}

export const handleInstagramMessage = async (
  models: IModels,
  msg: IMsg,
  subdomain: string,
) => {
  const { action, payload } = msg;
  const doc = JSON.parse(payload || '{}');
  if (doc.internal) {
    return models.ConversationMessages.addMessage(doc, doc.userId);
  }

 if (action === 'reply-post') {
  const { conversationId, content = '', attachments = [], userId } = doc;

  const commentConversation =
    await models.InstagramCommentConversation.findOne({
      erxesApiId: conversationId,
    });

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

  let strippedContent = stripHtml(content).result.trim();
  strippedContent = strippedContent.replace(/&amp;/g, '&');

  if (!strippedContent && attachments.length === 0) {
    throw new Error('Message content is empty');
  }

  const data: { message: string } = {
    message: strippedContent,
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
      `${commentConversation.comment_id}/replies`,
      data,
      inboxConversation.integrationId,
    );

    await models.InstagramCommentConversationReply.create({
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

    if (user && user._id) {
      await sendNotifications(subdomain, {
        user,
        conversations: [inboxConversation],
        type: 'conversationStateChange',
        mobile: true,
        messageContent: strippedContent,
      });
    }

    return { status: 'success' };
  } catch (e) {
    debugError(`Instagram comment reply error: ${e.message}`);
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

    const tag = extraInfo && extraInfo.tag ? extraInfo.tag : '';

    const images = (content.match(/<img[^>]* src="([^"]*)"/g) || []).map(
      (img) => img.match(/src="([^"]*)"/)[1],
    );
    images.forEach((img) => attachments.push({ type: 'image', url: img }));

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
            messaging_type: tag ? 'MESSAGE_TAG' : 'RESPONSE',
            ...(tag && { tag }),
          },
          integrationId,
        );

        if (resp) {
          localMessage = await models.InstagramConversationMessages.addMessage(
            {
              ...doc,
              conversationId: conversation._id,
              integrationId: conversation.integrationId,
              mid: resp.message_id,
            },
            doc.userId,
          );
        }
      }
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
            messaging_type: tag ? 'MESSAGE_TAG' : 'RESPONSE',
            ...(tag && { tag }),
          },
          integrationId,
        );

        if (resp) {
          localMessage = await models.InstagramConversationMessages.addMessage(
            {
              ...doc,
              conversationId: conversation._id,
              integrationId: conversation.integrationId,
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

    if (!localMessage) {
      throw new Error('Failed to send message: no response from Instagram API');
    }

    return {
      status: 'success',
      data: { ...localMessage.toObject(), conversationId },
    };
  }
};
