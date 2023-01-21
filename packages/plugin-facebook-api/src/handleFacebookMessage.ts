import * as strip from 'strip';

import { IModels } from './connectionResolver';
import { generateAttachmentMessages, sendReply } from './utils';

/**
 * Handle requests from erxes api
 */
export const handleFacebookMessage = async (models: IModels, msg) => {
  const { action, payload } = msg;
  const doc = JSON.parse(payload || '{}');

  if (action === 'reply-messenger') {
    const {
      integrationId,
      conversationId,
      content = '',
      attachments = [],
      extraInfo
    } = doc;
    const tag = extraInfo && extraInfo.tag ? extraInfo.tag : '';

    const regex = new RegExp('<img[^>]* src="([^"]*)"', 'g');

    const images: string[] = (content.match(regex) || []).map(m =>
      m.replace(regex, '$1')
    );

    images.forEach(img => {
      attachments.push({ type: 'image', url: img });
    });

    let strippedContent = strip(content);

    strippedContent = strippedContent.replace(/&amp;/g, '&');

    const conversation = await models.Conversations.getConversation({
      erxesApiId: conversationId
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

      const generatedAttachments = generateAttachmentMessages(attachments);

      for (const message of generatedAttachments) {
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

    return {
      status: 'success',
      // inbox conversation id is used for mutation response,
      // therefore override local id
      data: { ...localMessage.toObject(), conversationId }
    };
  }
};
