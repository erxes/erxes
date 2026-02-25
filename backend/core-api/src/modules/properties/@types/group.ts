import {
  ICursorPaginateParams,
  IListParams,
  IOffsetPaginateParams,
} from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IFieldGroup {
  name: string;
  code: string;
  description: string;
  contentType: string;
  contentTypeId: string;

  order: number;

  logics: string;
}

export interface IFieldGroupDocument extends IFieldGroup, Document {
  _id: string;

  createdBy: string;
  updatedBy: string;
}

export interface IFieldGroupParams extends IListParams {
  contentType: string;
  contentTypeId?: string;
  codes?: string[];
}

export interface IFieldGroupCursorParams extends ICursorPaginateParams {}
export interface IFieldGroupOffsetParams extends IOffsetPaginateParams {}