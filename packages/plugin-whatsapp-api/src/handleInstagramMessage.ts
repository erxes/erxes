import * as strip from 'strip';

import { IModels } from './connectionResolver';
import { generateAttachmentMessages, sendReply } from './utils';
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

  if (action === 'reply-messenger') {
    const { integrationId, conversationId, content, attachments, extraInfo } =
      doc;
    const tag = extraInfo && extraInfo.tag ? extraInfo.tag : '';
    const regex = new RegExp('<img[^>]* src="([^"]*)"', 'g');
    const images: string[] = (content.match(regex) || []).map((m) =>
      m.replace(regex, '$1')
    );
    images.forEach((img) => {
      attachments.push({ type: 'image', url: img });
    });
    const conversation = await models.Conversations.getConversation({
      erxesApiId: conversationId
    });
    let strippedContent = strip(content);
    strippedContent = strippedContent.replace(/&amp;/g, '&');
    const { senderId, recipientId } = conversation;
    let localMessage;
    try {
      if (strippedContent) {
        const resp = await sendReply(
          models,
          `${senderId}/messages`, // Update the endpoint here
          {
            messaging_product: 'whatsapp',
            to: recipientId, // Pass `recipientId` directly
            type: 'text',
            text: { body: strippedContent }, // Set the text message content,
            tag
          },
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
      }

      for (const message of generateAttachmentMessages(
        subdomain,
        attachments
      )) {
        try {
          let mediaPayload;
          if (message.attachment.type === 'image') {
            mediaPayload = {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: recipientId,
              type: 'image',
              image: {
                link: message.attachment.payload.url // Use the URL for images
              },
              tag
            };
          } else if (message.attachment.type === 'video') {
            mediaPayload = {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: recipientId,
              type: 'video',
              video: {
                link: message.attachment.payload.url // Use the URL for videos
              },
              tag
            };
          }

          const resp = await sendReply(
            models,
            `${senderId}/messages`,
            mediaPayload,
            integrationId
          );
          if (resp) {
            await models.ConversationMessages.addMessage({
              ...doc,
              conversationId: conversation._id,
              mid: resp.message_id
            });
          }
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
