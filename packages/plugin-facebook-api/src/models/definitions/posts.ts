import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IPost {
  postId: string;
  recipientId: string;
  senderId: string;
  content: string;
  erxesApiId?: string;
  attachments: string[];
  timestamp: Date;
  permalink_url: string;
  customerId?: string;
}

export interface IPostDocument extends IPost, Document {}

export const postSchema = new Schema({
  _id: field({ pkey: true }),
  postId: { type: String, index: true },
  recipientId: { type: String, index: true },
  senderId: String,
  content: String,
  attachments: [String],
  erxesApiId: String,
  customerId: { type: String, optional: true },
  permalink_url: String,
  timestamp: Date
});

postSchema.index({ recipientId: 1, postId: 1 });
