import { Document } from 'mongoose';
import { IAttachment } from 'erxes-api-shared/core-types';
import type {
  TelegramInboxPoll,
  TelegramMessageMetadata,
} from '../utils/content';

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
  attachmentFileIds?: string[];
  metadata?: TelegramMessageMetadata;
  pollId?: string;
  poll?: TelegramInboxPoll;
  processedEditDate?: number;
  processedUpdateId?: number;
  pollUpdateId?: number;
  pollUpdateAt?: Date;
  customerId?: string;
  userId?: string;
  senderName?: string;
  processingToken?: string;
  processingUntil?: Date;
}

export interface ITelegramConversationMessageDocument
  extends ITelegramConversationMessage,
    Document {
  _id: string;
}
