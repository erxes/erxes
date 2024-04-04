import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IField {
  code: string;
  text: string;
  type: string;
  show: boolean;
}

export interface IContentType {
  siteId: string;
  code: string;
  displayName: string;
  fields: IField[];

  createdBy?: string;
  modifiedBy?: string;
}

export interface IContentTypeDocument extends IContentType, Document {
  _id: string;

  createdAt: Date;
  modifiedAt: Date;
}

export const fieldSchema = new Schema(
  {
    code: field({ type: String }),
    text: field({ type: String }),
    type: field({ type: String }),
    show: field({ type: Boolean })
  },
  { _id: false }
);

export const contentTypeSchema = new Schema({
  siteId: field({ type: String, optional: true, label: 'Site Id' }),
  code: field({ type: String, label: 'Name' }),
  displayName: field({ type: String, label: 'Description' }),
  fields: field({ type: [fieldSchema] }),

  createdBy: field({ type: String, optional: true, label: 'Created by' }),
  modifiedBy: field({ type: String, optional: true, label: 'Modified by' }),

  createdAt: field({ type: Date, label: 'Created at', esType: 'date' }),
  modifiedAt: field({ type: Date, label: 'Modified at', esType: 'date' })
});
