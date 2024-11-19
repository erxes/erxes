import { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface ITag {
  clientPortalId: string;
  name: string;
  colorCode?: string;
  slug: string;
  parentId?: string;
  createdUserId: string;
}

export interface ITagDocument extends ITag, Document {
  _id: string;
}

export const tagSchema = new Schema<ITagDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    clientPortalId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    createdUserId: { type: String, ref: 'User' },
    colorCode: { type: String },
    parentId: { type: String },
  },
  { timestamps: true }
);



tagSchema.index({ slug: 1, clientPortalId: 1 }, { sparse: true });
