import { Document } from 'mongoose';
import { IAttachment } from 'erxes-api-shared/core-types';

export interface ITelegramConversationMessage {
  integrationId: string;
  chatId: string;
  messageId: string;
  conversationId: string;
  erxesApiId?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: IAttachment[];
  customerId?: string;
  userId?: string;
}

export interface ITelegramConversationMessageDocument
  extends ITelegramConversationMessage,
    Document {
  _id: string;
}
