import { IModels } from './connectionResolver';
import { generateAttachmentMessages, sendReply } from './utils';

export const handleWhatsAppMessage = async (
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

  const {
    integrationId,
    conversationId,
    content = '',
    attachments = [],
    extraInfo
  } = doc;

  const tag = extraInfo?.tag || '';
  const images = (content.match(/<img[^>]* src="([^"]*)"/g) || []).map(
    (img) => img.match(/src="([^"]*)"/)[1]
  );
  images.forEach((img) => attachments.push({ type: 'image', url: img }));

  function stripAndFormat(html) {
    return html
      .replace(/<\/p>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  }
  let strippedContent = stripAndFormat(content);

  const conversation = await models.Conversations.getConversation({
    erxesApiId: conversationId
  });
  const { senderId, recipientId } = conversation;
  let localMessage;

  try {
    if (strippedContent) {
      const resp = await sendReply(
        models,
        `${senderId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: recipientId,
          type: 'text',
          text: { body: strippedContent },
          tag
        },
        integrationId
      );

      if (resp) {
        localMessage = await models.ConversationMessages.addMessage(
          {
            ...doc,
            conversationId: conversation._id,
            mid: resp.message_id
          },
          doc.userId
        );
      }
    }

    for (const message of generateAttachmentMessages(subdomain, attachments)) {
      const {
        type,
        payload: { url }
      } = message.attachment;
      const mediaPayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientId,
        type,
        [type]: { link: url },
        tag
      };
      const resp = await sendReply(
        models,
        `${senderId}/messages`,
        mediaPayload,
        integrationId
      );
      if (resp) {
        localMessage = await models.ConversationMessages.addMessage(
          {
            ...doc,
            conversationId: conversation._id,
            mid: resp.message_id
          },
          doc.userId
        );
      }
    }
  } catch (e) {
    if (localMessage) {
      await models.ConversationMessages.deleteOne({
        _id: localMessage._id
      });
    }
    throw new Error(e.message);
  }

  return {
    status: 'success',
    data: { ...localMessage.toObject(), conversationId }
  };
};
