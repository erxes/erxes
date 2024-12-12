import { Document, Schema } from 'mongoose';
import slugify from 'slugify';
import {nanoid} from 'nanoid';
import { attachmentSchema, IAttachment, IPdfAttachment } from '@erxes/api-utils/src/types';
import { customFieldSchema, ICustomField } from '@erxes/api-utils/src/definitions/common';

export interface IPost {
  clientPortalId: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  categoryIds?: string[];
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  tagIds?: string[];
  authorId?: string;
  featured?: boolean;
  featuredDate?: Date | null;
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
  videoUrl?: string;
  pdfAttachment?: IPdfAttachment;

  customFieldsData?: ICustomField;
}

export interface IPostDocument extends IPost, Document {
  _id: string;
}

export const postSchema = new Schema<IPostDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    clientPortalId: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String },
    excerpt: { type: String, default: '', optional: true },
    categoryIds: { type: [String], ref: 'PostCategory' },
    status: { type: String, default: 'draft', enum: ['draft', 'published', 'scheduled', 'archived'] },
    tagIds: { type: [String]},
    authorId: { type: String, ref: 'User' },
    viewCount: { type: Number, default: 0 },
    publishedDate: { type: Date },

    featured: { type: Boolean, default: false },
    featuredDate: { type: Date },
  
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
    pdfAttachment: { type: Object, optional: true, label: 'PDF attachment' },
    videoUrl: { type: String, label: 'Video URL' },
    customFieldsData: {
      type: [customFieldSchema],
      optional: true,
      label: "Custom fields data"
    },
  },
  { timestamps: true }
);

postSchema.index({ slug: 1, clientPortalId: 1 }, { unique: true, sparse: true });
