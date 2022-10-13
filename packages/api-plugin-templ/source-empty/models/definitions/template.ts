import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ITemplate {
  name: string;
}

export interface ITemplateDocument extends ITemplate, Document {
  _id: string;
}

export const templateSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' })
});
