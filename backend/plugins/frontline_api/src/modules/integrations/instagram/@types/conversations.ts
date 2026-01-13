import { Document, Schema } from 'mongoose';

export interface IConversation {
  // id on erxes-api
  erxesApiId?: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  content: string;
  integrationId: string;
  isBot: boolean;
  botId?: string;
}

export interface IConversationDocument extends IConversation, Document {}