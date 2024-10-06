import { Document, Schema } from 'mongoose';
import slugify from 'slugify';
import {nanoid} from 'nanoid';
import { attachmentSchema, IAttachment } from '@erxes/api-utils/src/types';

export interface IPost {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  categoryIds?: string[];
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  tagIds?: string[];
  authorId?: string;
  scheduledDate?: Date;
  autoArchiveDate?: Date;
  publishedDate?: Date;

  viewCount?: number;

  reactions?: string[];
  reactionCounts?: { [key: string]: number };

  thumbnail?: IAttachment;
  images?: IAttachment[];
  video?: IAttachment;
  audio?: IAttachment;
  documents?: IAttachment[];
  attachments?: IAttachment[];
}

export interface IPostDocument extends IPost, Document {
  _id: string;
}

export const postSchema = new Schema<IPostDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String },
    excerpt: { type: String, default: '', optional: true },
    categoryIds: { type: [Schema.Types.ObjectId], ref: 'PostCategory' },
    status: { type: String, default: 'draft' },
    tagIds: [{ type: [Schema.Types.ObjectId], ref: 'Tag' }],
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    viewCount: { type: Number, default: 0 },
    // createdDate: { type: Date, default: Date.now },
    // modifiedDate: { type: Date, default: Date.now },
    publishedDate: { type: Date },
  
    scheduledDate: { type: Date },
    autoArchiveDate: { type: Date },

    reactions: [{ type: String }],
    reactionCounts: { type: Schema.Types.Mixed },
    thumbnail: { type: attachmentSchema, label: 'Thumbnail' },
    images: [{ type: attachmentSchema, label: 'Image Gallery' }],
    video: { type: attachmentSchema, label: 'Video' },
    audio: { type: attachmentSchema, label: 'Audio' },
    documents: [{ type: attachmentSchema, label: 'Documents' }],
    attachments: [{ type: attachmentSchema, label: 'Attachments' }],
  },
  { timestamps: true }
);

postSchema.pre<IPostDocument>('save', async function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});
