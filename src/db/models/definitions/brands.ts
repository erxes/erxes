import { Document, Schema } from 'mongoose';
import { field } from '../utils';

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
const brandEmailConfigSchema = new Schema({
  type: field({
    type: String,
    enum: ['simple', 'custom'],
  }),
  template: field({ type: String }),
});

export const brandSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String }),
  name: field({ type: String }),
  description: field({ type: String, optional: true }),
  userId: field({ type: String }),
  createdAt: field({ type: Date }),
  emailConfig: field({ type: brandEmailConfigSchema }),
});
