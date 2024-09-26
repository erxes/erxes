import { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface IPostCategory {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status?: string;
}

export interface IPostCategoryDocument extends IPostCategory, Document {
  _id: string;
  createdAt: Date;
}

export const postCategorySchema = new Schema<IPostCategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    parentId: { type: String },
    status: { type: String, default: 'active' },
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
