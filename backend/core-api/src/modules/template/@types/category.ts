import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface ITemplateCategory {
  name: string;
  parentId: string;
  code: string;

  createdBy: string;

  updatedBy: string;
}

export interface ITemplateCategoryDocument extends ITemplateCategory, Document {
  _id: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface ITemplateCategoryParams extends ICursorPaginateParams {
  searchValue?: string;
  types?: string[];
  parentIds?: string[];

  createdBy?: string;
  updatedBy?: string;

  dateFilters?: string;
}
