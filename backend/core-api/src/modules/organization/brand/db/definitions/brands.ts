import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

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

export const brandSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    code: { type: String, label: 'Code' },
    name: { type: String, label: 'Name' },
    description: {
      type: String,
      optional: true,
      label: 'Description',
    },
    userId: { type: String, label: 'Created by' },
    emailConfig: {
      type: brandEmailConfigSchema,
      label: 'Email config',
    },
  },
  {
    timestamps: true,
  },
);
