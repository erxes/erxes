import { Document, Schema } from 'mongoose';
import { field } from '../utils';
import { COC_CONTENT_TYPES } from './constants';

export interface IInternalNote {
  contentType: string;
  contentTypeId: string;
  content: string;
}

export interface IInternalNoteDocument extends IInternalNote, Document {
  _id: string;
  createdUserId: string;
  createdDate: Date;
}

// Mongoose schemas =======================

export const internalNoteSchema = new Schema({
  _id: field({ pkey: true }),
  contentType: field({
    type: String,
    enum: COC_CONTENT_TYPES.ALL,
  }),
  contentTypeId: field({ type: String }),
  content: field({
    type: String,
  }),
  createdUserId: field({
    type: String,
  }),
  createdDate: field({
    type: Date,
  }),
});
