import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface IIntegration {
  kind: string;
  name?: string;
  brandId?: string;
  languageCode?: string;
  tagIds?: string[];
  formId?: string;
  isActive?: boolean;
  channelIds?: string[];
}

export interface IIntegrationDocument extends IIntegration, Document {
  _id: string;
  createdUserId: string;
}

// schema for integration document
export const integrationSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdUserId: field({ type: String, label: 'Created by' }),

    kind: field({
      type: String,
      label: 'Kind'
    }),

    name: field({ type: String, label: 'Name' }),
    brandId: field({ type: String, label: 'Brand' }),

    languageCode: field({
      type: String,
      optional: true,
      label: 'Language code'
    }),
    tagIds: field({ type: [String], label: 'Tags', index: true }),
    formId: field({ type: String, label: 'Form' }),
    isActive: field({
      type: Boolean,
      optional: true,
      default: true,
      label: 'Is active'
    }),
  }),
  'erxes_integrations'
);
