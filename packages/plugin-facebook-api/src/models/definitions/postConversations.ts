import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IPostConversation {
  // id on erxes-api
  erxesApiId?: string;
  postId: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  content: string;
  integrationId: string;
  customerId?: string;
}

export interface IPostConversationDocument
  extends IPostConversation,
    Document {}

export const postConversationSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiId: String,
  postId: { type: String, index: true },
  timestamp: Date,
  integrationId: String,
  content: String,
  customerId: { type: String, optional: true }
});

postConversationSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });
