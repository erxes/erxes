import { Document } from 'mongoose';

export interface ITelegramConversation {
  integrationId: string;
  erxesApiId?: string;
  chatId: string;
  migratedToChatId?: string;
  chatType: 'private' | 'group' | 'supergroup' | 'channel';
  chatTitle?: string;
  messageThreadId: number;
  topicName?: string;
  timestamp: Date;
  content: string;
}

export interface ITelegramConversationDocument
  extends ITelegramConversation,
    Document {
  _id: string;
}
