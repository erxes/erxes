import {
  attachmentSchema,
  customFieldSchema,
} from 'erxes-api-shared/core-modules';
import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

import { IWebPostDocument } from '@/webbuilder/@types/webPosts';

export const webPostSchema = new Schema<IWebPostDocument>(
  {
    _id: mongooseStringRandomId,
    webId: { type: String, required: true },
    clientPortalId: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true, default: 'post' },
    slug: { type: String, required: true },
    content: { type: String },
    excerpt: { type: String, default: '', optional: true },
    categoryIds: { type: [String] },
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
    authorId: { type: String },
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

webPostSchema.index(
  { slug: 1, webId: 1, clientPortalId: 1 },
  { unique: true, sparse: true },
);

