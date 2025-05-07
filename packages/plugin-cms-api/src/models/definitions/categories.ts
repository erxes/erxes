import { Document, Schema } from 'mongoose';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import {
  customFieldSchema,
  ICustomField,
} from '@erxes/api-utils/src/definitions/common';

export interface IPostCategory {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status?: 'active' | 'inactive';
  clientPortalId: string;
  customFieldsData?: ICustomField[];
}

export interface IPostCategoryDocument extends IPostCategory, Document {
  _id: string;
  createdAt: Date;
}

export const postCategorySchema = new Schema<IPostCategoryDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    clientPortalId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    parentId: { type: String },
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
    customFieldsData: { type: [customFieldSchema], optional: true },
  },
  { timestamps: true }
);

postCategorySchema.index({ slug: 1, clientPortalId: 1 }, { sparse: true });
