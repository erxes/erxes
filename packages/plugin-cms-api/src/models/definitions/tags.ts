import { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IPostTag {
  clientPortalId: string;
  name: string;
  colorCode?: string;
  slug: string;

  createdUserId: string;
}

export interface IPostTagDocument extends IPostTag, Document {
  _id: string;
}

export const postTagSchema = new Schema<IPostTagDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    clientPortalId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    createdUserId: { type: String, ref: 'User' },
    colorCode: { type: String },
  },
  { timestamps: true }
);



postTagSchema.index({ slug: 1, clientPortalId: 1 }, { sparse: true });
