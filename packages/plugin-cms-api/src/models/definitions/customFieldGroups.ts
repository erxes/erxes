import { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface ICustomFieldGroup {
  clientPortalId: string;
  label: string;
  code: string;
  order: number;
}

export interface ICustomFieldGroupDocument extends ICustomFieldGroup, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const fieldGroupSchema = new Schema<ICustomFieldGroupDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    clientPortalId: { type: String, required: true },
    label: { type: String, required: true },
    code: { type: String, unique: true },
    order: { type: Number},
  },
  { timestamps: true }
);
