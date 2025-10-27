import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IField {
  name: string;
  code: string;
  fieldName: string;
  groupId: string;
  contentType: string;
  contentTypeId: string;

  type: string;
  order: number;
  isVisible: boolean;

  logics: any;
  validations: any;
}

export interface IFieldDocument extends IField, Document {
  createdBy: string;
  updatedBy: string;
}

export interface IFieldParams extends IListParams, ICursorPaginateParams {
  contentType: string;
  contentTypeId?: string;
  groupIds?: string[];
  isVisible?: boolean;
  isVisibleToCreate?: boolean;
  searchable?: boolean;
}
