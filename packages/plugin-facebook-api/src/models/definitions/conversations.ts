import { Document, Schema, HydratedDocument } from 'mongoose';

import { field } from './utils';

export interface IConversation {
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

export type IConversationDocument = HydratedDocument<IConversation>;

export const conversationSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiId: String,
  timestamp: Date,
  senderId: { type: String, index: true },
  recipientId: { type: String, index: true },
  integrationId: String,
  content: String,
  isBot: Boolean,
  botId: { type: String, optional: true }
});

conversationSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });
