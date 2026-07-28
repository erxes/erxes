import { Document } from 'mongoose';
import { DiscordAttachment } from '@/integrations/discord/@types/activity';

export interface IDiscordConversationMessage {
  // Discord message id (snowflake) — used for idempotency
  messageId: string;
  conversationId: string;
  content: string;
  // the following derive from inbox
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: DiscordAttachment[];
  customerId?: string;
  userId?: string;
  internal?: boolean;
  fromBot?: boolean;
}

export interface IDiscordConversationMessageDocument
  extends IDiscordConversationMessage,
    Document {
  _id: string;
}
