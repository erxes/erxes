import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';
export interface IResponseTemplate {
  name?: string;
  content?: string;
  channelId?: string;
  files?: string[];
}

export interface IResponseTemplateDocument extends IResponseTemplate, Document {
  _id: string;
}

export interface IResponseTemplatesEdit extends IResponseTemplate {
  _id: string;
}

export interface ResponseTemplatesFilter
  extends ICursorPaginateParams,
    IListParams,
    IResponseTemplate {
  channelId?: string;
  userId?: string;
  createdAt?: Date;
}
