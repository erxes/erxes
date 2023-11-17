import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IComment {
  commentId: string;
  isResolved: boolean;
  postId: string;
  recipientId: string;
  parentId: string;
  senderId: string;
  attachments: string[];
  content: string;
  erxesApiId: string;
  timestamp: Date;
  permalink_url: string;
}

export interface ICommentDocument extends IComment, Document {}

export const commentSchema = new Schema({
  _id: field({ pkey: true }),
  commentId: { type: String, index: true },
  postId: { type: String, index: true },
  recipientId: String,
  senderId: String,
  parentId: String,
  permalink_url: String,
  attachments: [String],
  content: String,
  erxesApiId: String,
  timestamp: Date,
  isResolved: { type: Boolean, default: false }
});

commentSchema.index({ postId: 1, commentId: 1 }, { unique: true });
