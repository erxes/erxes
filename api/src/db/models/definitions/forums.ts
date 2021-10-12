import { Document, Schema } from 'mongoose';
import { field } from './utils';
import {
  REACTION_CHOICES,
  FORUM_CONTENT_TYPE,
  FORUM_DISCUSSION_STATUSES
} from './constants';
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
  forumId?: string;
}

export interface ITopicDocument extends ICommonFields, ITopic, Document {
  _id: string;
}

export interface IDiscussion {
  title?: string;
  description?: string;
  tagIds?: string[];
  pollOptions?: string[];
  pollData?: JSON;
  topicId?: string;
  forumId?: string;
  content?: string;
  startDate?: Date;
  closeDate?: Date;
  attachments?: any[];
  isComplete?: boolean;
  status?: string;
}

export interface IDiscussionDocument
  extends ICommonFields,
    IDiscussion,
    Document {
  _id: string;
}

export interface IComment {
  title?: string;
  content?: string;
  discussionId?: string;
}

export interface ICommentDocument extends ICommonFields, IComment, Document {
  _id: string;
}

export interface IForumReaction {
  type?: string;
  contentType?: string;
  contentTypeId?: string;
}

export interface IForumReactionDocument
  extends ICommonFields,
    IForumReaction,
    Document {
  _id: string;
}

export const attachmentSchema = new Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true })
  },
  { _id: false }
);
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
  forumId: field({ type: String, label: 'Forum' }),
  ...commonFields
});

export const discussionSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String, optional: true, label: 'Title' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  tagIds: field({ type: [String], optional: true, label: 'Tag' }),
  topicId: field({ type: String, label: 'Topic' }),
  forumId: field({ type: String, label: 'Forum' }),
  content: field({ type: String, label: 'Content' }),
  status: field({
    type: String,
    enum: FORUM_DISCUSSION_STATUSES.ALL,
    default: FORUM_DISCUSSION_STATUSES.PUBLISH,
    label: 'Status'
  }),
  startDate: field({ type: Date, label: 'Start Date' }),
  closeDate: field({ type: Date, label: 'Close Date' }),
  isComplete: field({ type: Boolean, label: 'Complete' }),
  attachments: field({ type: [attachmentSchema], label: 'Attachments' }),
  pollOptions: field({
    type: [String],
    optional: true,
    label: 'Options'
  }),
  pollData: field({ type: Object }),

  ...commonFields
});

export const commentSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String, label: 'Title' }),
  content: field({ type: String, label: 'Content' }),
  discussionId: field({ type: String, label: 'Discussion' }),
  ...commonFields
});

export const forumReactionSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String, enum: REACTION_CHOICES.ALL, label: 'Type' }),
  contentType: field({
    type: String,
    enum: FORUM_CONTENT_TYPE.ALL,
    label: 'Content type'
  }),
  contentTypeId: field({ type: String, label: 'Content type item' }),
  ...commonFields
});
