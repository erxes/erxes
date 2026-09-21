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
  tagIds?: string[];
}

export interface IDocumentDocument extends IDocument, Document {
  _id: string;
  createdUserId: string;
}

export interface IDocumentFilterQueryParams
  extends IListParams, ICursorPaginateParams {
  limit: number;
  contentType: string;
  subType?: string;
  userIds?: string[];
  dateFilters?: string;
  tagIds?: string[];
}

export type DocumentAccessUser = {
  _id: string;
  isOwner?: boolean;
};

export type DocumentReadInput = {
  _id: string;
  user?: DocumentAccessUser;
  action?: 'view' | 'edit' | 'delete';
};

export type DocumentSaveInput = {
  _id?: string;
  doc: IDocument & { createdUserId: string };
  user?: DocumentAccessUser;
};

export type DocumentProcessInput = {
  _id: string;
  replacerIds?: string[];
  config?: Record<string, unknown>;
  user?: DocumentAccessUser;
};

export const DOCUMENT_APPROVAL_CONTENT_TYPE = 'core:documents';
