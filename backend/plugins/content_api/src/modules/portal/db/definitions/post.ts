import {
  attachmentSchema,
  customFieldSchema,
} from 'erxes-api-shared/core-modules';
import { Schema } from 'mongoose';
import {
  IPostCategoryDocument,
  IPostDocument,
  IPostTagDocument,
} from '@/portal/@types/post';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const postSchema = new Schema<IPostDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true, default: 'post' },
    slug: { type: String, required: true, unique: true },
    content: { type: String },
    excerpt: { type: String, default: '', optional: true },
    categoryIds: { type: [String], ref: 'PostCategory' },
    status: {
      type: String,
      default: 'draft',
      enum: ['draft', 'published', 'scheduled', 'archived'],
    },
    tagIds: { type: [String] },
    authorKind: {
      type: String,
      default: 'user',
      enum: ['user', 'portalUser'],
    },
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

    customFieldsData: { type: [customFieldSchema], optional: true },
  },
  { timestamps: true },
);

postSchema.index(
  { slug: 1, clientPortalId: 1 },
  { unique: true, sparse: true },
);

export const postCategorySchema = new Schema<IPostCategoryDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    parentId: { type: String },
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
    customFieldsData: { type: [customFieldSchema], optional: true },
  },
  { timestamps: true },
);

postCategorySchema.index({ slug: 1, clientPortalId: 1 }, { sparse: true });

export const postTagSchema = new Schema<IPostTagDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    createdUserId: { type: String, ref: 'User' }, // team member
    colorCode: { type: String },
  },
  { timestamps: true },
);

postTagSchema.index({ slug: 1, clientPortalId: 1 }, { sparse: true });
