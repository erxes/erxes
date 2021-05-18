import { Document, Schema } from 'mongoose';
import { field } from './utils';

interface ICommonFields {
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

export interface IForum {
  title?: string;
  description?: string;
  brandId?: string;
  languageCode?: string;
}

export interface IForumDocument extends ICommonFields, IForum, Document {
  _id: string;
}

export interface ITopic {
  title?: string;
  description?: string;
}

export interface ITopicDocument extends ICommonFields, IForum, Document {
  _id: string;
}

export interface IDiscussion {
  title?: string;
  description?: string;
  tagId?: string;
}

export interface IDiscussionDocument
  extends ICommonFields,
    IDiscussion,
    Document {
  _id: string;
}

// Mongoose schemas ==================

// Schema for common fields

const commonFields = {
  createdBy: field({ type: String, label: 'Created by' }),
  createdDate: field({ type: Date, label: 'Created at' }),
  modifiedBy: field({ type: String, label: 'Modified by' }),
  modifiedDate: field({ type: Date, label: 'Modified at' })
};

export const forumSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String, optional: true, label: 'Title' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  brandId: field({ type: String, optional: true, label: 'Brand' }),
  languageCode: field({
    type: String,
    optional: true,
    label: 'Language codes'
  }),
  ...commonFields
});

export const topicSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String, optional: true, label: 'Title' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  ...commonFields
});

export const discussionSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String, optional: true, label: 'Title' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  tagId: field({ type: String, optional: true, label: 'Tag' }),
  ...commonFields
});
