import { ILocationOption } from '@erxes/api-utils/src/types';
import { Document, Schema } from 'mongoose';
import { INPUT_TYPE } from './constants';
import { field, schemaWrapper } from './utils';

export interface ISubmission {
  _id: string;
  value: any;
  type?: string;
  validation?: string;
  associatedFieldId?: string;
  stageId?: string;
  groupId?: string;
  column?: number;
  productId?: string;
}

export interface ILogic {
  fieldId: string;
  tempFieldId?: string;
  logicOperator?: string;
  logicValue?: string | number | Date | string[];
}

export const logicSchema = new Schema(
  {
    fieldId: field({ type: String }),
    logicOperator: field({
      type: String,
      optional: true
    }),
    logicValue: field({
      type: Schema.Types.Mixed,
      optional: true
    })
  },
  { _id: false }
);

const ObjectListSchema = new Schema({
  key: field({ type: String, optional: true, label: 'Key' }),
  label: field({ type: String, optional: true, label: 'Label' }),
  type: field({
    type: String,
    enum: INPUT_TYPE.map(option => option.value),
    optional: true,
    label: 'Type'
  })
});

interface IVisibility {
  isVisible?: boolean;
  isVisibleInDetail?: boolean;
}

interface IObjectListConfig {
  key: string;
  label: string;
  type: string;
}

export interface IField extends IVisibility {
  contentType?: string;
  contentTypeId?: string;
  type?: string;
  validation?: string;
  text: string;
  content?: string;
  description?: string;
  options?: string[];
  locationOptions?: ILocationOption[];
  objectListConfigs?: IObjectListConfig[];
  isRequired?: boolean;
  isDefinedByErxes?: boolean;
  isVisibleToCreate?: boolean;
  order?: number;
  groupId?: string;
  canHide?: boolean;
  lastUpdatedUserId?: string;
  associatedFieldId?: string;
  code?: string;

  logics?: ILogic[];
  logicAction?: string;
  tempFieldId?: string;
  column?: number;
  groupName?: string;
  pageNumber?: number;
  showInCard?: boolean;
  productCategoryId?: string;
}

export interface IFieldDocument extends IField, Document {
  _id: string;
}

export interface IFieldGroup extends IVisibility {
  name?: string;
  contentType?: string;
  order?: number;
  isDefinedByErxes?: boolean;
  description?: string;
  lastUpdatedUserId?: string;
  code?: string;
  config?: any;

  logics?: ILogic[];
  logicAction?: string;
}

export interface IFieldGroupDocument extends IFieldGroup, Document {
  _id: string;
}

// Mongoose schemas =============
export const fieldSchema = schemaWrapper(
  new Schema({
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
    field: field({ type: String, optional: true, label: 'Field identifier' }),
    description: field({
      type: String,
      optional: true,
      label: 'Description'
    }),
    code: field({
      type: String,
      optional: true,
      label: 'Unique code'
    }),
    options: field({
      type: [String],
      optional: true,
      label: 'Options'
    }),
    locationOptions: field({
      type: Array,
      optional: true,
      label: 'Location Options'
    }),
    objectListConfigs: field({
      type: [ObjectListSchema],
      optional: true,
      label: 'object list config'
    }),
    isRequired: field({ type: Boolean, label: 'Is required' }),
    isDefinedByErxes: field({ type: Boolean, label: 'Is defined by erxes' }),
    order: field({ type: Number, label: 'Order' }),
    groupId: field({ type: String, label: 'Field group' }),
    isVisible: field({ type: Boolean, default: true, label: 'Is visible' }),
    isVisibleInDetail: field({
      type: Boolean,
      default: true,
      label: 'Is group visible in detail'
    }),
    canHide: field({
      type: Boolean,
      default: true,
      label: 'Can toggle isVisible'
    }),
    isVisibleToCreate: field({
      type: Boolean,
      default: false,
      label: 'Is visible to create'
    }),
    searchable: field({
      type: Boolean,
      default: false,
      label: 'Useful for searching'
    }),
    lastUpdatedUserId: field({ type: String, label: 'Last updated by' }),
    associatedFieldId: field({
      type: String,
      optional: true,
      label: 'Stores custom property fieldId for form field id'
    }),
    logics: field({ type: [logicSchema] }),
    column: field({ type: Number, optional: true }),
    logicAction: field({
      type: String,
      label:
        'If action is show field will appear when logics fulfilled, if action is hide it will disappear when logic fulfilled'
    }),
    content: field({
      type: String,
      optional: true,
      label: 'Stores html content form of field type with html'
    }),
    pageNumber: field({
      type: Number,
      optional: true,
      label: 'Number of page',
      min: 1
    }),
    showInCard: field({
      type: Boolean,
      default: false,
      optional: true,
      label: 'Show in card'
    }),
    productCategoryId: field({
      type: String,
      optional: true,
      label: 'Product category'
    })
  })
);

export const fieldGroupSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    // customer, company
    contentType: field({
      type: String,
      label: 'Content type'
    }),
    order: field({ type: Number, label: 'Order' }),
    isDefinedByErxes: field({
      type: Boolean,
      default: false,
      label: 'Is defined by erxes'
    }),
    description: field({ type: String, label: 'Description' }),
    code: field({
      type: String,
      optional: true,
      label: 'Unique code'
    }),
    // Id of user who updated the group
    lastUpdatedUserId: field({ type: String, label: 'Last updated by' }),
    isVisible: field({ type: Boolean, default: true, label: 'Is visible' }),
    isVisibleInDetail: field({
      type: Boolean,
      default: true,
      label: 'Is group visible in detail'
    }),
    config: { type: Object },

    logics: field({ type: [logicSchema] }),

    logicAction: field({
      type: String,
      label:
        'If action is show field will appear when logics fulfilled, if action is hide it will disappear when logic fulfilled'
    })
  })
);
