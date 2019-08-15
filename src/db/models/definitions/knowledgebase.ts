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
  reactionChoices: field({ type: [String], default: [] }),
  reactionCounts: field({ type: Object }),
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

export const topicSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String }),
    description: field({ type: String, optional: true }),
    brandId: field({ type: String, optional: true }),

    categoryIds: field({
      type: [String],
      required: false,
    }),

    color: field({ type: String, optional: true }),
    backgroundImage: field({ type: String, optional: true }),

    languageCode: field({
      type: String,
      optional: true,
    }),

    ...commonFields,
  }),
);
