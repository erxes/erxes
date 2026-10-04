import { IModels } from '~/connectionResolvers';
import { ITelegramBotDocument } from '@/integrations/telegram/@types/bot';
import { ITelegramConversationMessageDocument } from '@/integrations/telegram/@types/conversationMessages';
import { telegramMessageSchema } from '@/integrations/telegram/utils/message';
import {
  getOrCreateCustomer,
  getOrCreateConversation,
  getOrCreateMessage,
} from '@/integrations/telegram/controller/store';

export const receiveTelegramMessage = async ({
  models,
  subdomain,
  bot,
  payload,
}: {
  models: IModels;
  subdomain: string;
  bot: ITelegramBotDocument;
  payload: unknown;
}): Promise<ITelegramConversationMessageDocument | null> => {
  const message = telegramMessageSchema.parse(payload);
  const sender = message.from;

  if (
    message.chat.type !== 'private' ||
    !sender ||
    sender.is_bot ||
    message.sender_chat ||
    !message.text?.trim() ||
    message.message_id === 0 ||
    message.is_topic_message ||
    message.message_thread_id !== undefined ||
    message.business_connection_id !== undefined ||
    message.guest_query_id !== undefined
  ) {
    return null;
  }

  const integrationId = bot.erxesApiId;

  if (!integrationId) {
    throw new Error('Telegram bot is not linked to an inbox integration');
  }

  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    integrationId,
    sender,
  );

  const conversation = await getOrCreateConversation(
    models,
    subdomain,
    integrationId,
    message,
    customer,
  );

  return getOrCreateMessage(models, subdomain, conversation, message, customer);
};
