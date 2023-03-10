import { attachmentSchema } from '@erxes/api-utils/src/definitions/common';
import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ISite {
  name: string;
  domain?: string;
  templateId?: string;
  coverImage?: any;

  createdBy?: string;
  modifiedBy?: string;
}

export interface ISiteDocument extends ISite, Document {
  _id: string;

  createdAt: Date;
  modifiedAt: Date;
}

export const siteSchema = new Schema({
  name: field({ type: String, label: 'Name', unique: true }),
  domain: field({ type: String, optional: true, label: 'Domain' }),
  templateId: field({ type: String, optional: true, label: 'Template id' }),
  coverImage: field({
    type: attachmentSchema,
    optional: true,
    label: 'Cover image'
  }),

  createdBy: field({ type: String, optional: true, label: 'Created by' }),
  modifiedBy: field({ type: String, optional: true, label: 'Modified by' }),

  createdAt: field({ type: Date, label: 'Created at', esType: 'date' }),
  modifiedAt: field({ type: Date, label: 'Modified at', esType: 'date' })
});
