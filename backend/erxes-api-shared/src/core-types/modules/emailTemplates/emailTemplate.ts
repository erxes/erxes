import { Document } from 'mongoose';
import { TEmailContentFormat } from '../../../core-modules/email-content/types';

export interface IEmailTemplate {
  name: string;
  description?: string;
  /** Block content, as every template was written before the email editor. */
  content?: string;
  /** The email editor's own document. */
  contentJson?: Record<string, any>;
  contentFormat?: TEmailContentFormat;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEmailTemplateDocument extends IEmailTemplate, Document {
  _id: string;
}
