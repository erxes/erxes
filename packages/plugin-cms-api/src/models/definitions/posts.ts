import { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface IPost {
  title: string;
  slug: string;
  content?: string;
  categoryId?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  tagIds?: string[];
  authorId?: string;
  createdDate: Date;
  modifiedDate: Date;
  publishedDate?: Date;
  publishedUserId?: string;
  scheduledDate?: Date;
  autoArchiveDate?: Date;
}

export interface IPostDocument extends IPost, Document {
  _id: string;
}

export const postSchema = new Schema<IPostDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: 'PostCategory' },
    status: { type: String, default: 'draft' },
    tagIds: [{ type: [Schema.Types.ObjectId], ref: 'Tag' }],
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date, default: Date.now },
    publishedDate: { type: Date },
    publishedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    scheduledDate: { type: Date },
    autoArchiveDate: { type: Date },
  },
  { timestamps: true }
);

postSchema.pre<IPostDocument>('save', async function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});
