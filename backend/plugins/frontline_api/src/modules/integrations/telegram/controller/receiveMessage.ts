import { sendAutomationTrigger } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import {
  TELEGRAM_MESSAGE_TRIGGER_TYPE,
  TTelegramTriggerTarget,
} from '@/integrations/telegram/meta/automation/types';
import { ITelegramBotDocument } from '@/integrations/telegram/@types/bot';
import { ITelegramConversationMessageDocument } from '@/integrations/telegram/@types/conversationMessages';
import { telegramMessageSchema } from '@/integrations/telegram/utils/message';
import {
  getOrCreateCustomer,
  getOrCreateConversation,
  getOrCreateMessage,
} from '@/integrations/telegram/controller/store';

/** Routes a supported tenant webhook to its chat/topic and canonical inbox message. */
export const receiveTelegramMessage = async ({
  models,
  subdomain,
  bot,
  payload,
  updateId,
}: {
  models: IModels;
  subdomain: string;
  bot: ITelegramBotDocument;
  payload: unknown;
  updateId?: number;
}): Promise<ITelegramConversationMessageDocument | null> => {
  const message = telegramMessageSchema.parse(payload);
  const integrationId = bot.erxesApiId;
  if (!integrationId)
    throw new Error('Telegram bot is not linked to an inbox integration');
  const integration = await models.Integrations.findOne({
    _id: integrationId,
    kind: 'telegram-messenger',
  });
  if (!integration || integration.isActive === false) return null;

  const oldChatId =
    message.migrate_from_chat_id ??
    (message.migrate_to_chat_id ? message.chat.id : undefined);
  const newChatId =
    message.migrate_to_chat_id ??
    (message.migrate_from_chat_id ? message.chat.id : undefined);
  if (oldChatId && newChatId) {
    await models.TelegramConversations.updateMany(
      { integrationId, chatId: String(oldChatId) },
      { $set: { migratedToChatId: String(newChatId), chatType: 'supergroup' } },
    );
  }
  if (
    message.message_id === 0 ||
    message.business_connection_id !== undefined ||
    message.guest_query_id !== undefined ||
    message.direct_messages_topic !== undefined ||
    (message.chat.type === 'private' &&
      (!message.from || message.sender_chat)) ||
    (!message.sender_chat && String(message.from?.id) === bot.botId)
  )
    return null;

  // sender_chat represents a channel or anonymous admin, not the fake `from` user
  // Telegram supplies for backward compatibility. Never create a contact for it.
  const sender =
    !message.sender_chat && !message.from?.is_bot ? message.from : undefined;
  const customer = sender
    ? await getOrCreateCustomer(models, subdomain, integrationId, sender)
    : undefined;

  const conversation = await getOrCreateConversation(
    models,
    subdomain,
    integrationId,
    message,
    customer,
  );

  const isEdit = (message.edit_date ?? 0) > 0;
  // A retried webhook finds the message already linked and must not re-enrol
  const alreadyLinked =
    !isEdit &&
    !!(await models.TelegramConversationMessages.exists({
      integrationId,
      chatId: String(message.chat.id),
      messageId: String(message.message_id),
      erxesApiId: { $ne: null },
    }));

  const stored = await getOrCreateMessage(
    models,
    subdomain,
    conversation,
    message,
    customer,
    updateId,
  );

  if (
    !isEdit &&
    !alreadyLinked &&
    customer?.erxesApiId &&
    conversation.erxesApiId
  ) {
    const target: TTelegramTriggerTarget = {
      _id: stored._id,
      content: stored.content,
      conversationId: conversation.erxesApiId,
      customerId: customer.erxesApiId,
      integrationId,
      chatId: stored.chatId,
      chatType: conversation.chatType,
      attachments: stored.attachments,
      createdAt: stored.createdAt,
    };

    sendAutomationTrigger(
      subdomain,
      { type: TELEGRAM_MESSAGE_TRIGGER_TYPE, targets: [target] },
      { transport: 'trpc' },
    );
  }

  return stored;
};
