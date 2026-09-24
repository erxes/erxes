import { stripHtml } from 'string-strip-html';
import { IModels } from '~/connectionResolvers';
import { IWhatsappMessagePayload } from '@/integrations/whatsapp/@types/utils';
import {
  sendWhatsappMedia,
  sendWhatsappText,
  whatsappMediaTypeFromMime,
} from '@/integrations/whatsapp/utils';

interface IWhatsappDispatchMessage {
  action: string;
  payload: string;
  type: string;
}

const sanitizeAndFormat = (html = ''): string =>
  stripHtml(html.replace(/<\/p>/gi, '\n')).result.trim();

export const handleWhatsappMessage = async (
  models: IModels,
  msg: IWhatsappDispatchMessage,
) => {
  const { action, payload } = msg;
  const doc = JSON.parse(payload || '{}') as IWhatsappMessagePayload;

  if (action !== 'reply-messenger' && action !== 'reply-unknown') {
    return { status: 'success' };
  }

  const conversation = await models.WhatsappConversations.getConversation({
    erxesApiId: doc.conversationId,
  });

  const integration = await models.WhatsappIntegrations.getIntegration({
    erxesApiId: doc.integrationId,
  });

  const content = sanitizeAndFormat(doc.content || '');
  const attachments = doc.attachments || [];

  if (!content && attachments.length === 0) {
    throw new Error('Message content is empty');
  }

  const sendableAttachments: Array<{ url: string; type?: string }> = [];

  for (const attachment of attachments) {
    if (!attachment.url) {
      throw new Error(
        `Attachment "${attachment.name || 'untitled'}" has no url and cannot be sent`,
      );
    }

    sendableAttachments.push({ url: attachment.url, type: attachment.type });
  }

  let mid: string | undefined;

  if (content) {
    const textResponse = await sendWhatsappText({
      accessToken: integration.accessToken,
      phoneNumberId: integration.phoneNumberId,
      recipientPhone: conversation.senderId,
      text: content,
    });

    mid = textResponse.messages?.[0]?.id;
  }

  for (const attachment of sendableAttachments) {
    const mediaResponse = await sendWhatsappMedia({
      accessToken: integration.accessToken,
      phoneNumberId: integration.phoneNumberId,
      recipientPhone: conversation.senderId,
      mediaType: whatsappMediaTypeFromMime(attachment.type),
      url: attachment.url,
    });

    mid = mid || mediaResponse.messages?.[0]?.id;
  }

  const localMessage = await models.WhatsappConversationMessages.addMessage(
    {
      conversationId: conversation._id,
      content,
      mid: mid || `${Date.now()}`,
      attachments,
    },
    doc.userId,
  );

  return {
    status: 'success',
    data: {
      ...localMessage.toObject(),
      conversationId: doc.conversationId,
    },
  };
};
