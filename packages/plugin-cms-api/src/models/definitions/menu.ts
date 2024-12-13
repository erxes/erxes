import { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IMenuItem {
  clientPortalId: string;
  label: string;
  contentType: string;
  contentTypeID: string;
  kind: string;
  icon: string;
  url: string;
  parentId?: string;
  order?: number;
}

export interface IMenuItemDocument extends IMenuItem, Document {
  _id: string;
}

export const menuItemSchema = new Schema<IMenuItemDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    clientPortalId: { type: String, required: true },
    label: { type: String, required: true },
    contentType: { type: String },
    contentTypeID: { type: String },
    kind: { type: String, required: true },
    icon: { type: String },
    url: { type: String },
    parentId: { type: String },
    order: { type: Number , required: true },
  },
  { timestamps: true }
);
