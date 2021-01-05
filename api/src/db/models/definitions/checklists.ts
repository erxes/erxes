import { Document, Schema } from 'mongoose';
import { ACTIVITY_CONTENT_TYPES } from './constants';
import { field } from './utils';

export interface IChecklist {
  contentType: string;
  contentTypeId: string;
  title: string;
}

export interface IChecklistDocument extends IChecklist, Document {
  _id: string;
  createdUserId: string;
  createdDate: Date;
}

export interface IChecklistItem {
  checklistId: string;
  content: string;
  isChecked: boolean;
}

export interface IChecklistItemDocument extends IChecklistItem, Document {
  _id: string;
  createdUserId: string;
  createdDate: Date;
}

// Mongoose schemas =======================

export const checklistSchema = new Schema({
  _id: field({ pkey: true }),
  contentType: field({
    type: String,
    enum: ACTIVITY_CONTENT_TYPES.ALL,
    label: 'Content type',
    index: true
  }),
  order: field({ type: Number }),
  contentTypeId: field({ type: String, label: 'Content type item', index: true }),
  title: field({ type: String, label: 'Title' }),
  createdUserId: field({ type: String, label: 'Created by' }),
  createdDate: field({ type: Date, label: 'Created at' })
});

export const checklistItemSchema = new Schema({
  _id: field({ pkey: true }),
  checklistId: field({ type: String, label: 'Check list', index: true }),
  content: field({ type: String, label: 'Content' }),
  isChecked: field({ type: Boolean, label: 'Is checked' }),
  createdUserId: field({ type: String, label: 'Created by' }),
  createdDate: field({ type: Date, label: 'Created at' }),
  order: field({ type: Number })
});
