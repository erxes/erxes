import { Document } from 'mongoose';
import { DiscordAttachment } from '@/integrations/discord/@types/activity';

export interface IDiscordConversationMessage {
  messageId: string;
  conversationId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  attachments?: DiscordAttachment[];
  replyTo?: {
    messageId: string;
    content?: string;
    authorName?: string;
  };
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
