import {
  ICursorPaginateParams,
  IListParams,
  IOffsetPaginateParams,
} from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface FieldOption {
  label: string;
  value: string;
}

export interface IField {
  name: string;
  code: string;
  groupId: string;
  contentType: string;
  contentTypeId: string;

  type: string;
  order: number;

  options?: FieldOption[];
  icon?: string;

  logics?: any;
  validations?: any;
}

export interface IFieldDocument extends IField, Document {
  _id: string;

  createdBy: string;
  updatedBy: string;
}

export interface IFieldParams extends IListParams {
  contentType: string;
  contentTypeId?: string;
  groupId?: string[];
  icon?: string;
}

export interface IFieldCursorParams extends ICursorPaginateParams {}
export interface IFieldOffsetParams extends IOffsetPaginateParams {}