import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IField {
  name: string;
  code: string;
  groupId: string;
  contentType: string;
  contentTypeId: string;

  type: string;
  order: number;

  options?: string[];
  icon?: string;

  logics?: any;
  validations?: any;
}

export interface IFieldDocument extends IField, Document {
  createdBy: string;
  updatedBy: string;
}

export interface IFieldParams extends IListParams, ICursorPaginateParams {
  contentType: string;
  contentTypeId?: string;
  groupId?: string[];
  icon?: string;
}
