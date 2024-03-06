import { Document, Schema } from 'mongoose';

import { field } from './utils';
import { attachmentSchema } from '@erxes/api-utils/src/definitions/common';

export interface ICommentConversationReply {
  mid: string;
  commentConversationId: string;
  parentId: String;
  recipientId: string;
  senderId: string;
  isResolved: boolean;
  comment_id: string;
  permalink_url: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: any;
  userId?: string;
  customerId?: string;
}

export interface ICommentConversationReplyDocument
  extends ICommentConversationReply,
    Document {}

export const commentConversationReplySchema = new Schema({
  _id: field({ pkey: true }),
  mid: { type: String, label: 'comment message id' },
  comment_id: { type: String },
  parentId: String,
  recipientId: { type: String },
  senderId: { type: String },
  content: String,
  customerId: { type: String, optional: true },
  userId: { type: String, optional: true },
  createdAt: { type: Date, default: Date.now, label: 'Created At' },
  updatedAt: field({ type: Date, index: true, label: 'Updated At' }),
  attachments: [attachmentSchema],
  isResolved: { type: Boolean, default: false },
});
