import { ICustomField } from '@erxes/api-utils/src/definitions/common';
import { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface ICustomPostType {
  _id: string;
  clientPortalId: string;

  label: string;
  pluralLabel: string;
  code: string;
  description?: string;
  isActive: boolean;

}

export interface ICustomPostTypeDocument extends ICustomPostType, Document {
  _id: string;
}

export const customPostTypeSchema = new Schema<ICustomPostTypeDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    clientPortalId: { type: String, required: true },

    label: { type: String, required: true },
    pluralLabel: { type: String, required: true },
    code: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String },
  },
  { timestamps: true }
);

customPostTypeSchema.index({ name: 1, clientPortalId: 1 }, { unique: true });
