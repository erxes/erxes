import { stripHtml } from 'string-strip-html';
import { IModels } from '~/connectionResolvers';
import { IWhatsappMessagePayload } from '@/integrations/whatsapp/@types/utils';
import { sendWhatsappText } from '@/integrations/whatsapp/utils';

interface IWhatsappDispatchMessage {
  action: string;
  payload: string;
  type: string;
}

const sanitizeAndFormat = (html = ''): string => {
  let output = html;
  let previous = '';

  while (output !== previous) {
    previous = output;
    output = output.replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '');
  }

  return stripHtml(output).result.trim();
};

export const handleWhatsappMessage = async (
  models: IModels,
  msg: IWhatsappDispatchMessage,
) => {
  const { action, payload } = msg;
  const doc = JSON.parse(payload || '{}') as IWhatsappMessagePayload;

  if (doc.internal) {
    return models.ConversationMessages.addMessage(doc, doc.userId);
  }

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

  if (!content) {
    throw new Error('Message content is empty');
  }

  const response = await sendWhatsappText({
    accessToken: integration.accessToken,
    phoneNumberId: integration.phoneNumberId,
    recipientPhone: conversation.senderId,
    text: content,
  });

  const mid = response.messages?.[0]?.id || `${Date.now()}`;

  const localMessage = await models.WhatsappConversationMessages.addMessage(
    {
      conversationId: conversation._id,
      content,
      mid,
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
