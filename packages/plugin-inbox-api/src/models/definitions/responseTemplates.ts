import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IResponseTemplate {
  name?: string;
  content?: string;
  brandId?: string;
  files?: string[];
}

export interface IResponseTemplateDocument extends IResponseTemplate, Document {
  _id: string;
}

export const responseTemplateSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    content: field({ type: String, label: 'Content' }),
    brandId: field({ type: String, label: 'Brand' }),
    files: field({ type: Array, label: 'Files' })
  })
);