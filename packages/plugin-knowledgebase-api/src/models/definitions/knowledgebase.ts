import { attachmentSchema } from '@erxes/api-utils/src/types';
import { Document, Schema } from 'mongoose';
import { PUBLISH_STATUSES } from './constants';
import { field, schemaWrapper } from './utils';

interface ICommonFields {
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

interface IFormCodes {
  brandId: string;
  formId: string;
}

export interface IArticle {
  title?: string;
  summary?: string;
  content?: string;
  status?: string;
  reactionChoices?: string[];
  reactionCounts?: { [key: string]: number };
  categoryId?: string;
  topicId?: string;

  forms?: IFormCodes[];
}

export interface IArticleDocument extends ICommonFields, IArticle, Document {
  _id: string;
}

export interface ICategory {
  title?: string;
  description?: string;
  articleIds?: string[];
  icon?: string;
  parentCategoryId?: string;
  topicId?: string;
}

export interface ICategoryDocument extends ICommonFields, ICategory, Document {
  _id: string;
}

export interface ITopic {
  title?: string;
  description?: string;
  brandId?: string;
  categoryIds?: string[];
  color?: string;
  backgroundImage?: string;
  languageCode?: string;
}

export interface ITopicDocument extends ICommonFields, ITopic, Document {
  _id: string;
}

// Mongoose schemas ==================

// Schema for common fields
const commonFields = {
  createdBy: field({ type: String, label: 'Created by' }),
  createdDate: field({ type: Date, label: 'Created at' }),
  modifiedBy: field({ type: String, label: 'Modified by' }),
  modifiedDate: field({ type: Date, label: 'Modified at' }),
  title: field({ type: String, label: 'Title' })
};

const formcodesSchema = new Schema(
  {
    brandId: field({ type: String, label: 'Brand id' }),
    formId: field({ type: String, label: 'Form id' })
  },
  { _id: false }
);

export const articleSchema = new Schema({
  _id: field({ pkey: true }),
  summary: field({ type: String, optional: true, label: 'Summary' }),
  content: field({ type: String, label: 'Content' }),
  status: field({
    type: String,
    enum: PUBLISH_STATUSES.ALL,
    default: PUBLISH_STATUSES.DRAFT,
    label: 'Status'
  }),
  reactionChoices: field({
    type: [String],
    default: [],
    label: 'Reaction choices'
  }),
  viewCount: field({
    type: Number,
    default: 0,
    label: 'Count how many times visitor viewed'
  }),
  image: field({ type: attachmentSchema, label: 'Thumbnail image' }),
  attachments: field({ type: [attachmentSchema], label: 'Attachments' }),
  reactionCounts: field({ type: Object, label: 'Reaction counts' }),
  topicId: field({ type: String, optional: true, label: 'Topic' }),
  categoryId: field({ type: String, optional: true, label: 'Category' }),

  forms: field({ type: [formcodesSchema], label: 'Forms' }),
  ...commonFields
});

export const categorySchema = new Schema({
  _id: field({ pkey: true }),
  description: field({ type: String, optional: true, label: 'Description' }),
  articleIds: field({ type: [String], label: 'Articles' }),
  icon: field({ type: String, optional: true, label: 'Icon' }),
  parentCategoryId: field({
    type: String,
    optional: true,
    label: 'Parent category'
  }),
  topicId: field({ type: String, optional: true, label: 'Topic' }),
  ...commonFields
});

export const topicSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    description: field({ type: String, optional: true, label: 'Description' }),
    brandId: field({ type: String, optional: true, label: 'Brand' }),

    categoryIds: field({
      type: [String],
      required: false,
      label: 'Categories'
    }),

    color: field({ type: String, optional: true, label: 'Color' }),
    backgroundImage: field({
      type: String,
      optional: true,
      label: 'Background image'
    }),

    languageCode: field({
      type: String,
      optional: true,
      label: 'Language codes'
    }),

    ...commonFields
  })
);
