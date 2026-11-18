import {
  attachmentSchema,
  customFieldSchema,
} from 'erxes-api-shared/core-modules';
import { Schema } from 'mongoose';
import {
  POST_REACTION_TYPES,
  IPostCategoryDocument,
  IPostDocument,
  IPostTagDocument,
} from '@/cms/@types/posts';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const postSchema = new Schema<IPostDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true },
    webId: { type: String, optional: true },
    count: { type: Number, default: 0 },
    title: { type: String, required: true },
    type: { type: String, required: true, default: 'post' },
    // Unique per CMS only, through the { slug, clientPortalId } index below.
    slug: { type: String, required: true },
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

    seoTitle: { type: String, optional: true },
    seoDescription: { type: String, optional: true },

    reactions: [
      {
        type: String,
        enum: POST_REACTION_TYPES,
      },
    ],
    reactionCounts: { type: Schema.Types.Mixed, default: {} },
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

postSchema.index({ webId: 1 });

// Public post lists filter by site, status and category, ordered by _id.
postSchema.index({ clientPortalId: 1, status: 1, categoryIds: 1, _id: 1 });

// Post lookups by number and the next-number query on every create.
postSchema.index({ clientPortalId: 1, count: 1 });

export const postCategorySchema = new Schema<IPostCategoryDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    parentId: { type: String },
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
    customFieldsData: { type: [customFieldSchema], optional: true },
  },
  { timestamps: true },
);

postCategorySchema.index(
  { slug: 1, clientPortalId: 1 },
  { unique: true, sparse: true },
);

postCategorySchema.index({ clientPortalId: 1, status: 1, _id: 1 });

export const postTagSchema = new Schema<IPostTagDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true },
    name: { type: String, required: true },
    // Unique per CMS only, through the { clientPortalId, slug } index below.
    slug: { type: String, required: true },
    createdUserId: { type: String, ref: 'User' }, // team member
    colorCode: { type: String },
  },
  { timestamps: true },
);

postTagSchema.index({ clientPortalId: 1, slug: 1 }, { unique: true });
