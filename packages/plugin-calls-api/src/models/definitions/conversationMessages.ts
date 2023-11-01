import { Document, Schema } from 'mongoose';

import { attachmentSchema } from '@erxes/api-utils/src/definitions/common';
import { field } from './utils';

export interface IConversationMessage {
  callId: string;
  conversationId: string;
  content: string;
  // from inbox
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: any;
  customerId?: string;
  userId?: string;
  fromBot?: boolean;
  callStatus?: boolean;
  internal?: boolean;
}

export interface IConversationMessageDocument
  extends IConversationMessage,
    Document {
  _id: string;
}

export const conversationMessageSchema = new Schema({
  _id: field({ pkey: true }),
  callId: { type: String, label: 'Call id' },
  content: { type: String },
  // the following derives from inbox
  attachments: [attachmentSchema],
  conversationId: field({ type: String, index: true }),
  customerId: field({ type: String, index: true }),

  userId: field({ type: String, index: true }),
  createdAt: field({ type: Date, index: true }),
  updatedAt: field({ type: Date, index: true }),
  callStatus: field({ type: Boolean }),
  internal: field({ type: Boolean })
});
