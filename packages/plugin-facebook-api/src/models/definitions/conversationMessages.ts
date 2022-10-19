import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IConversationMessage {
  mid: string;
  conversationId: string;
  content: string;
}

export interface IConversationMessageDocument
  extends IConversationMessage,
    Document {}

export const conversationMessageSchema = new Schema({
  _id: field({ pkey: true }),
  mid: { type: String, unique: true },
  conversationId: String,
  content: String
});
