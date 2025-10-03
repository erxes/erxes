import { schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

export interface IBrandEmailConfig {
  email?: string;
  type?: string;
  template?: string;
}

export interface IBrand {
  code?: string;
  name?: string;
  description?: string;
  memberIds?: string[];
  userId?: string;
  emailConfig?: IBrandEmailConfig;
}

export interface IBrandDocument extends IBrand, Document {
  _id: string;
  createdAt: Date;
}

// Mongoose schemas ===========
export const brandEmailConfigSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['simple', 'custom'],
      label: 'Type',
    },
    template: { type: String, label: 'Template', optional: true },
    email: {
      type: String,
      label: 'Email',
      optional: true,
    },
  },
  { _id: false },
);

export const brandSchema = schemaWrapper(
  new Schema({
    code: { type: String, label: 'Code' },
    name: { type: String, label: 'Name' },
    description: {
      type: String,
      optional: true,
      label: 'Description',
    },
    userId: { type: String, label: 'Created by' },
    createdAt: { type: Date, label: 'Created at' },
    emailConfig: {
      type: brandEmailConfigSchema,
      label: 'Email config',
    },
  }),
);
