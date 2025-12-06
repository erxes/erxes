import { Document } from 'mongoose';

import { IPdfAttachment } from 'erxes-api-shared/core-types';

interface ICommonFields {
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  code?: string;
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
  isPrivate?: boolean;
  reactionChoices?: string[];
  reactionCounts?: { [key: string]: number };
  viewCount?: number;
  categoryId?: string;
  topicId?: string;
  publishedUserId?: string;
  publishedAt?: Date;
  scheduledDate?: Date;

  forms?: IFormCodes[];

  pdfAttachment?: IPdfAttachment;
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
  code?: string;
  description?: string;
  brandId?: string;
  categoryIds?: string[];
  color?: string;
  backgroundImage?: string;
  languageCode?: string;
  notificationSegmentId?: string;
}

export interface ITopicDocument extends ICommonFields, ITopic, Document {
  _id: string;
}
