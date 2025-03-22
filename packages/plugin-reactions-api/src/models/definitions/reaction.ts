import { Schema, Document } from 'mongoose';
import { field } from './utils';

const CONTENT_TYPES = {
  ALL: ['exmFeed', 'knowledgebase']
};

export interface IComment {
  contentType: string;
  contentId: string;
  parentId: string;
  comment: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}
export interface ICommentDocument extends IComment, Document {
  _id: string;
}

export interface IEmoji {
  type: string;
  contentType: string;
  contentId: string;
  userId: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}
export interface IEmojiDocument extends IEmoji, Document {
  _id: string;
}
export const commentSchema = new Schema({
  _id: field({ pkey: true }),
  contentType: field({
    type: String,
    enum: CONTENT_TYPES.ALL,
    label: 'Connected content type'
  }),
  contentId: field({ type: String, label: 'Connected content id' }),
  parentId: field({ type: String }),
  comment: field({ type: String, label: 'Comment' }),
  createdBy: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' }),
  updatedBy: field({ type: String, label: 'Updated by' }),
  updatedAt: field({ type: Date, label: 'Updated at' })
});

export const emojiSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String, default: 'heart' }),
  contentType: field({
    type: String,
    enum: CONTENT_TYPES.ALL,
    label: 'Connected content type'
  }),
  contentId: field({ type: String, label: 'Connected content id' }),
  userId: field({ type: String }),
  createdAt: field({ type: Date, label: 'Created at' }),
  updatedBy: field({ type: String, label: 'Updated by' }),
  updatedAt: field({ type: Date, label: 'Updated at' })
});
