import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IExm {
  name: string;
}

export interface IExmDocument extends IExm, Document {
  _id: string;
  createdBy: string;
  createdAt: Date;
}

const featureSchema = new Schema({
  _id: field({ pkey: true }),
  contentType: field({ type: String }),
  icon: field({ type: String }),
  name: field({ type: String }),
  description: field({ type: String }),
  contentId: field({ type: String })
});

// Mongoose schemas =======================

export const exmSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Description' }),
  features: field({ type: [featureSchema] }),
  createdBy: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' })
});
