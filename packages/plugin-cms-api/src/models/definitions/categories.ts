import { Document, Schema } from 'mongoose';
import slugify from 'slugify';
import {nanoid} from 'nanoid';

export interface IPostCategory {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status?: 'active' | 'inactive';
}

export interface IPostCategoryDocument extends IPostCategory, Document {
  _id: string;
  createdAt: Date;
}

export const postCategorySchema = new Schema<IPostCategoryDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    parentId: { type: String },
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
  },
  { timestamps: true }
);

postCategorySchema.pre<IPostCategoryDocument>('save', async function (next) {
  console.log("*******", this, '*******')
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});
