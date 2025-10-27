import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IFieldGroup {
  name: string;
  code: string;
  description: string;
  contentType: string;
  contentTypeId: string;

  order: number;
  isVisible: boolean;
  alwaysOpen: boolean;

  logics: string;
}

export interface IFieldGroupDocument extends IFieldGroup, Document {
  createdBy: string;
  updatedBy: string;
}

export interface IFieldGroupParams extends IListParams, ICursorPaginateParams {
  contentType: string;
  contentTypeId?: string;
  isDefinedByErxes?: boolean;
  codes?: string[];
}
