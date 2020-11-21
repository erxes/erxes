import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IBrandEmailConfig {
  type?: string;
  template?: string;
}

interface IBrandEmailConfigDocument extends IBrandEmailConfig, Document {}

export interface IBrand {
  code?: string;
  name?: string;
  description?: string;
  userId?: string;
  emailConfig?: IBrandEmailConfig;
}

export interface IBrandDocument extends IBrand, Document {
  _id: string;
  emailConfig?: IBrandEmailConfigDocument;
  createdAt: Date;
}

// Mongoose schemas ===========
export const brandEmailConfigSchema = new Schema({
  type: field({
    type: String,
    enum: ['simple', 'custom'],
    label: 'Type'
  }),
  template: field({ type: String, label: 'Template' })
});

export const brandSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, label: 'Code' }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  userId: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' }),
  emailConfig: field({ type: brandEmailConfigSchema, label: 'Email config' })
});
