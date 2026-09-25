import { Document } from 'mongoose';
import { DiscordAttachment } from '@/integrations/discord/@types/activity';
import type { IMessageReplyTo } from '@/inbox/@types/conversationMessages';

export interface IDiscordConversationMessage {
  messageId: string;
  conversationId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  attachments?: DiscordAttachment[];
  replyTo?: IMessageReplyTo;
  customerId?: string;
  userId?: string;
  internal?: boolean;
  fromBot?: boolean;
}

export interface IDiscordConversationMessageDocument
  extends IDiscordConversationMessage, Document {
  _id: string;
}
