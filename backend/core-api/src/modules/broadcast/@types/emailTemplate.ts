import { Document } from 'mongoose';
import type { JSONContent } from '@tiptap/core';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';

export interface IBroadcastEmailTemplate {
  name: string;
  description?: string;
  contentJson: JSONContent;
  createdBy?: string;
}

export interface IBroadcastEmailTemplateDocument
  extends IBroadcastEmailTemplate, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBroadcastEmailTemplateQueryParams extends ICursorPaginateParams {
  searchValue?: string;
}
