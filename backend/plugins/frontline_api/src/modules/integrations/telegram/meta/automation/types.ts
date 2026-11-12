import type { IAttachment } from 'erxes-api-shared/core-types';

export const TELEGRAM_MODULE_NAME = 'telegram';
export const TELEGRAM_MESSAGE_COLLECTION = 'messages';
export const TELEGRAM_MESSAGE_TRIGGER_TYPE = `frontline:${TELEGRAM_MODULE_NAME}.${TELEGRAM_MESSAGE_COLLECTION}`;

/**
 * What `receiveTelegramMessage` enrolls for the Telegram message trigger; every
 * worker (filter, AI context, send action) reads this shape back.
 */
export type TTelegramTriggerTarget = {
  // Local Telegram message record id
  _id: string;
  content: string;
  // Inbox conversation id, so handoff, tickets and memory work unchanged
  conversationId: string;
  customerId: string;
  integrationId: string;
  chatId: string;
  chatType: 'private' | 'group' | 'supergroup' | 'channel';
  attachments?: IAttachment[];
  createdAt?: Date | string;
};

// "private" (default) answers one-to-one chats only; "all" also groups
export type TTelegramTriggerConfig = {
  keywords?: string;
  chatTypes?: 'private' | 'all';
};
