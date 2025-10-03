import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IDocument {
  contentType: string;
  subType: string;
  name: string;
  content: string;
  replacer: string;
  code?: string;
}

export interface IDocumentDocument extends IDocument, Document {
  _id: string;
  createdUserId: string;
}

export interface IDocumentFilterQueryParams
  extends IListParams,
    ICursorPaginateParams {
  limit: number;
  contentType: string;
  subType?: string;
  userIds?: string[];
  dateFilters?: string;
}
