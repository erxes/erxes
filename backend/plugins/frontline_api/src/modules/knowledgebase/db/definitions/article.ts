import { field } from '~/modules/knowledgebase/db/utils';
import { PUBLISH_STATUSES, commonFields } from '@/knowledgebase/db/definitions/constant'
import { Schema } from 'mongoose';
import { attachmentSchema } from 'erxes-api-shared/core-modules';

const formcodesSchema = new Schema(
    {
      brandId: field({ type: String, label: 'Brand id' }),
      formId: field({ type: String, label: 'Form id' }),
    },
    { _id: false },
  );


export const articleSchema = new Schema({
    _id: field({ pkey: true }),
    summary: field({ type: String, optional: true, label: 'Summary' }),
    content: field({ type: String, label: 'Content' }),
    status: field({
      type: String,
      enum: PUBLISH_STATUSES.ALL,
      default: PUBLISH_STATUSES.DRAFT,
      label: 'Status',
    }),
    scheduledDate: field({
      type: Date,
      optional: true,
      label: 'Scheduled date',
    }),
    isPrivate: field({
      type: Boolean,
      optional: true,
      default: false,
      label: 'isPrivate',
    }),
    reactionChoices: field({
      type: [String],
      default: [],
      label: 'Reaction choices',
    }),
    viewCount: field({
      type: Number,
      default: 0,
      label: 'Count how many times visitor viewed',
    }),
    image: field({ type: attachmentSchema, label: 'Thumbnail image' }),
    attachments: field({ type: [attachmentSchema], label: 'Attachments' }),
    reactionCounts: field({ type: Object, label: 'Reaction counts' }),
    topicId: field({ type: String, optional: true, label: 'Topic' }),
    categoryId: field({ type: String, optional: true, label: 'Category' }),
    publishedUserId:field({ type: String, optional: true, label: 'Published user'}),
    publishedAt: field({ type: Date, optional: true, label: 'Published at' }),
    forms: field({ type: [formcodesSchema], label: 'Forms' }),
  
    pdfAttachment: field({ type: Object, optional: true, label: 'PDF attachment' }),
    ...commonFields,
  });

articleSchema.index({ code: 1}, { unique: true, sparse: true });