import { HydratedDocument } from 'mongoose';

export interface IInstagramConversation {
  // id on erxes-api
  _id: string;
  erxesApiId?: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  content: string;
  integrationId: string;
  isBot: boolean;
  botId?: string;
}

export type IInstagramConversationDocument =
  HydratedDocument<IInstagramConversation>;
