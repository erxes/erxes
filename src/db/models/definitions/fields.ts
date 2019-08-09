import { Document, Schema } from 'mongoose';
import { FIELDS_GROUPS_CONTENT_TYPES } from './constants';
import { field } from './utils';

export interface IField {
  contentType?: string;
  contentTypeId?: string;
  type?: string;
  validation?: string;
  text?: string;
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
  contentType: field({ type: String }),

  // formId when contentType is form
  contentTypeId: field({ type: String }),

  type: field({ type: String }),
  validation: field({
    type: String,
    optional: true,
  }),
  text: field({ type: String }),
  description: field({
    type: String,
    optional: true,
  }),
  options: field({
    type: [String],
    optional: true,
  }),
  isRequired: field({ type: Boolean }),
  isDefinedByErxes: field({ type: Boolean }),
  order: field({ type: Number }),
  groupId: field({ type: String }),
  isVisible: field({ type: Boolean, default: true }),
  lastUpdatedUserId: field({ type: String }),
});

export const fieldGroupSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  // customer, company
  contentType: field({ type: String, enum: FIELDS_GROUPS_CONTENT_TYPES.ALL }),
  order: field({ type: Number }),
  isDefinedByErxes: field({ type: Boolean, default: false }),
  description: field({
    type: String,
  }),
  // Id of user who updated the group
  lastUpdatedUserId: field({ type: String }),
  isVisible: field({ type: Boolean, default: true }),
});
