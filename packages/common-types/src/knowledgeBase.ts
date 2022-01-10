import { Document } from 'mongoose';

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
  categoryId?: string;
  topicId?: string;
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
