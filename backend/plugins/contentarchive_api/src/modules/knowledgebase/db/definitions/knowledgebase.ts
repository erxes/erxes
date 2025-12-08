import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { PUBLISH_STATUSES } from '~/modules/knowledgebase/constants';

const commonFields = {
  createdBy: { type: String, label: 'Created by' },
  createdDate: { type: Date, label: 'Created at' },
  modifiedBy: { type: String, label: 'Modified by' },
  modifiedDate: { type: Date, label: 'Modified at' },
  title: { type: String, label: 'Title' },
  code: {
    type: String,
    optional: true,
    label: 'Code',
  },
};

const formcodesSchema = new Schema(
  {
    brandId: { type: String, label: 'Brand id' },
    formId: { type: String, label: 'Form id' },
  },
  { _id: false },
);

export const articleSchema = new Schema({
  _id: mongooseStringRandomId,
  summary: { type: String, optional: true, label: 'Summary' },
  content: { type: String, label: 'Content' },
  status: {
    type: String,
    enum: PUBLISH_STATUSES.ALL,
    default: PUBLISH_STATUSES.DRAFT,
    label: 'Status',
  },
  scheduledDate: {
    type: Date,
    optional: true,
    label: 'Scheduled date',
  },
  isPrivate: {
    type: Boolean,
    optional: true,
    default: false,
    label: 'isPrivate',
  },
  reactionChoices: {
    type: [String],
    default: [],
    label: 'Reaction choices',
  },
  viewCount: {
    type: Number,
    default: 0,
    label: 'Count how many times visitor viewed',
  },
  image: { type: attachmentSchema, label: 'Thumbnail image' },
  attachments: { type: [attachmentSchema], label: 'Attachments' },
  reactionCounts: { type: Object, label: 'Reaction counts' },
  topicId: { type: String, optional: true, label: 'Topic' },
  categoryId: { type: String, optional: true, label: 'Category' },
  publishedUserId: {
    type: String,
    optional: true,
    label: 'Published user',
  },
  publishedAt: { type: Date, optional: true, label: 'Published at' },
  forms: { type: [formcodesSchema], label: 'Forms' },

  pdfAttachment: {
    type: Object,
    optional: true,
    label: 'PDF attachment',
  },
  ...commonFields,
});

export const categorySchema = new Schema({
  _id: mongooseStringRandomId,
  description: { type: String, optional: true, label: 'Description' },
  articleIds: { type: [String], label: 'Articles' },
  icon: { type: String, optional: true, label: 'Icon' },
  parentCategoryId: {
    type: String,
    optional: true,
    label: 'Parent category',
  },
  topicId: { type: String, optional: true, label: 'Topic' },
  ...commonFields,
});

export const topicSchema = new Schema({
  _id: mongooseStringRandomId,
  description: { type: String, optional: true, label: 'Description' },
  brandId: { type: String, optional: true, label: 'Brand' },

  categoryIds: {
    type: [String],
    required: false,
    label: 'Categories',
  },

  color: { type: String, optional: true, label: 'Color' },
  backgroundImage: {
    type: String,
    optional: true,
    label: 'Background image',
  },

  languageCode: {
    type: String,
    optional: true,
    label: 'Language codes',
  },

  notificationSegmentId: {
    type: String,
    required: false,
  },

  ...commonFields,
});
