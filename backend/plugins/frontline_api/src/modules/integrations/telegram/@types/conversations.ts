import { Document } from 'mongoose';

export interface ITelegramConversation {
  integrationId: string;
  erxesApiId?: string;
  chatId: string;
  chatType: 'private' | 'group' | 'supergroup' | 'channel';
  chatTitle?: string;
  messageThreadId: number;
  timestamp: Date;
  content: string;
}

export interface ITelegramConversationDocument
  extends ITelegramConversation,
    Document {
  _id: string;
}
