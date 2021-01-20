import { Document, Schema } from 'mongoose';
import { PUBLISH_STATUSES } from './constants';
import { field, schemaWrapper } from './utils';

interface ICommonFields {
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

export interface IArticle {
  title?: string;
  summary?: string;
  content?: string;
  status?: string;
  reactionChoices?: string[];
  reactionCounts?: { [key: string]: number };
}

export interface IArticleDocument extends ICommonFields, IArticle, Document {
  _id: string;
}

export interface ICategory {
  title?: string;
  description?: string;
  articleIds?: string[];
  icon?: string;
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
  reactionCounts: field({ type: Object, label: 'Reaction counts' }),
  ...commonFields
});

export const categorySchema = new Schema({
  _id: field({ pkey: true }),
  description: field({ type: String, optional: true, label: 'Description' }),
  articleIds: field({ type: [String], label: 'Articles' }),
  icon: field({ type: String, optional: true, label: 'Icon' }),
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
