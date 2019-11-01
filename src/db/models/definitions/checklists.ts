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
  }),
  contentTypeId: field({ type: String }),
  title: field({ type: String }),
  createdUserId: field({ type: String }),
  createdDate: field({ type: Date }),
});

export const checklistItemSchema = new Schema({
  _id: field({ pkey: true }),
  checklistId: field({ type: String }),
  content: field({ type: String }),
  isChecked: field({ type: Boolean }),
  createdUserId: field({ type: String }),
  createdDate: field({ type: Date }),
});
