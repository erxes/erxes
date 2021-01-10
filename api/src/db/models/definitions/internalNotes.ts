import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IInternalNote {
  contentType: string;
  contentTypeId: string;
  content: string;
  mentionedUserIds?: string[];
}

export interface IInternalNoteDocument extends IInternalNote, Document {
  _id: string;
  createdUserId: string;
  createdAt: Date;
}

// Mongoose schemas =======================

export const internalNoteSchema = new Schema({
  _id: field({ pkey: true }),
  contentType: field({
    type: String,
    label: 'Content type',
    index: true
  }),
  contentTypeId: field({ type: String, label: 'Content item', index: true }),
  content: field({ type: String, label: 'Content' }),
  createdUserId: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' })
});
