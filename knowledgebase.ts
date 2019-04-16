import { Document, Schema } from 'mongoose';
import { field } from '../utils';
import { LANGUAGE_CHOICES, PUBLISH_STATUSES } from './constants';

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
  languageCode?: string;
}

export interface ITopicDocument extends ICommonFields, ITopic, Document {
  _id: string;
}

// Mongoose schemas ==================

// Schema for common fields
const commonFields = {
  createdBy: field({ type: String }),
  createdDate: field({
    type: Date,
  }),
  modifiedBy: field({ type: String }),
  modifiedDate: field({
    type: Date,
  }),
};

export const articleSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  summary: field({ type: String, optional: true }),
  content: field({ type: String }),
  status: field({
    type: String,
    enum: PUBLISH_STATUSES.ALL,
    default: PUBLISH_STATUSES.DRAFT,
  }),
  ...commonFields,
});

export const categorySchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  description: field({ type: String, optional: true }),
  articleIds: field({ type: [String] }),
  icon: field({ type: String, optional: true }),
  ...commonFields,
});

export const topicSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  description: field({ type: String, optional: true }),
  brandId: field({ type: String, optional: true }),

  categoryIds: field({
    type: [String],
    required: false,
  }),

  color: field({ type: String, optional: true }),

  languageCode: field({
    type: String,
    enum: LANGUAGE_CHOICES,
    optional: true,
  }),

  ...commonFields,
});
