import { telegramMessageActionConfigSchema } from '~/meta/automationConfigSchemas';
import {
  TELEGRAM_MESSAGE_COLLECTION,
  TELEGRAM_MODULE_NAME,
} from '@/integrations/telegram/meta/automation/types';

// Trigger fields, addressable as {{ trigger.<key> }}; {{ trigger.content }}
// feeds the AI agent input.
const telegramMessageTriggerOutput = {
  variables: [
    { key: '_id', label: 'Message ID' },
    { key: 'content', label: 'Message content' },
    { key: 'conversationId', label: 'Conversation ID' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'chatId', label: 'Telegram chat ID' },
    { key: 'chatType', label: 'Telegram chat type' },
    { key: 'createdAt', label: 'Message created at' },
  ],
};

const telegramMessageActionOutput = {
  variables: [
    { key: 'messageIds', label: 'Sent message IDs' },
    { key: 'content', label: 'Sent message content' },
    { key: 'conversationId', label: 'Conversation ID' },
  ],
};

export const telegramConstants = {
  actions: [
    {
      moduleName: TELEGRAM_MODULE_NAME,
      collectionName: TELEGRAM_MESSAGE_COLLECTION,
      method: 'create',
      configSchema: telegramMessageActionConfigSchema,
      icon: 'IconBrandTelegram',
      label: 'Send Telegram Message',
      description: 'Reply in the triggering Telegram chat as the bot.',
      output: telegramMessageActionOutput,
    },
  ],
  triggers: [
    {
      moduleName: TELEGRAM_MODULE_NAME,
      collectionName: TELEGRAM_MESSAGE_COLLECTION,
      icon: 'IconBrandTelegram',
      label: 'Telegram Message',
      description:
        'Start this workflow when the bot receives a Telegram message.',
      isCustom: true,
      output: telegramMessageTriggerOutput,
    },
  ],
};
