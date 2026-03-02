import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IRelatedContent {
  contentType: string;
  content: string[];
}

export interface ITemplate {
  name: string;
  description: string;
  contentId: string;
  contentType: string;
  content: string;
  relatedContents: IRelatedContent[];

  createdBy: string;
  updatedBy: string;

  categoryIds: string[];
}

export interface ITemplateDocument extends ITemplate, Document {
  _id: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface ITemplateParams extends ICursorPaginateParams {
  searchValue?: string;
  contentType?: string;
  categoryIds?: string[];
}