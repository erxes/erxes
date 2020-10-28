import { Document, Schema } from 'mongoose';
import { FIELDS_GROUPS_CONTENT_TYPES } from './constants';
import { field, schemaWrapper } from './utils';

export interface IField {
  contentType?: string;
  contentTypeId?: string;
  type?: string;
  validation?: string;
  text: string;
  description?: string;
  options?: string[];
  isRequired?: boolean;
  isDefinedByErxes?: boolean;
  order?: number;
  groupId?: string;
  isVisible?: boolean;
  lastUpdatedUserId?: string;
}

export interface IFieldDocument extends IField, Document {
  _id: string;
}

export interface IFieldGroup {
  name?: string;
  contentType?: string;
  order?: number;
  isDefinedByErxes?: boolean;
  description?: string;
  lastUpdatedUserId?: string;
  isVisible?: boolean;
}

export interface IFieldGroupDocument extends IFieldGroup, Document {
  _id: string;
}

// Mongoose schemas =============
export const fieldSchema = new Schema({
  _id: field({ pkey: true }),

  // form, customer, company
  contentType: field({ type: String, label: 'Content type' }),

  // formId when contentType is form
  contentTypeId: field({ type: String, label: 'Content type item' }),

  type: field({ type: String, label: 'Type' }),
  validation: field({
    type: String,
    optional: true,
    label: 'Validation'
  }),
  text: field({ type: String, label: 'Text' }),
  description: field({
    type: String,
    optional: true,
    label: 'Description'
  }),
  options: field({
    type: [String],
    optional: true,
    label: 'Options'
  }),
  isRequired: field({ type: Boolean, label: 'Is required' }),
  isDefinedByErxes: field({ type: Boolean, label: 'Is defined by erxes' }),
  order: field({ type: Number, label: 'Order' }),
  groupId: field({ type: String, label: 'Field group' }),
  isVisible: field({ type: Boolean, default: true, label: 'Is visible' }),
  lastUpdatedUserId: field({ type: String, label: 'Last updated by' })
});

export const fieldGroupSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    // customer, company
    contentType: field({
      type: String,
      enum: FIELDS_GROUPS_CONTENT_TYPES.ALL,
      label: 'Content type'
    }),
    order: field({ type: Number, label: 'Order' }),
    isDefinedByErxes: field({
      type: Boolean,
      default: false,
      label: 'Is defined by erxes'
    }),
    description: field({ type: String, label: 'Description' }),
    // Id of user who updated the group
    lastUpdatedUserId: field({ type: String, label: 'Last updated by' }),
    isVisible: field({ type: Boolean, default: true, label: 'Is visible' })
  })
);
