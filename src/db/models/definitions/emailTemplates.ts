import { Document, Schema } from 'mongoose';
import { field } from '../utils';

export interface IEmailTemplate {
  name: string;
  content: string;
}

export interface IEmailTemplateDocument extends IEmailTemplate, Document {
  _id: string;
}

export const emailTemplateSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  content: field({ type: String }),
});
