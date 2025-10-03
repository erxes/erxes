import { Document, Schema } from 'mongoose';
import { ILocationOption } from '../../types';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { INPUT_TYPE } from '../../constants';

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

  regexValidation?: string;
}

export interface ILogic {
  fieldId: string;
  tempFieldId?: string;
  logicOperator?: string;
  logicValue?: string | number | Date | string[];
}

export const logicSchema = new Schema(
  {
    fieldId: { type: String },
    logicOperator: {
      type: String,
      optional: true,
    },
    logicValue: {
      type: Schema.Types.Mixed,
      optional: true,
    },
  },
  { _id: false },
);

const ObjectListSchema = new Schema({
  key: { type: String, optional: true, label: 'Key' },
  label: { type: String, optional: true, label: 'Label' },
  type: {
    type: String,
    enum: INPUT_TYPE.map((option) => option.value),
    optional: true,
    label: 'Type',
  },
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
  regexValidation?: string;
  text: string;
  content?: string;
  description?: string;
  options?: string[];
  locationOptions?: ILocationOption[];
  objectListConfigs?: IObjectListConfig[];
  optionsValues?: string;
  isRequired?: boolean;
  isDefinedByErxes?: boolean;
  isVisibleToCreate?: boolean;
  isPermanent?: boolean;
  isLocked?: boolean;
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

  pageNumber?: number;
  showInCard?: boolean;
  productCategoryId?: string;

  relationType?: string;

  subFieldIds?: string[];
}

export interface IFieldDocument extends IField, Document {
  _id: string;
}

export interface IFieldGroup extends IVisibility {
  name?: string;
  contentType?: string;
  parentId?: string;
  order?: number;
  isDefinedByErxes?: boolean;
  alwaysOpen?: boolean;
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

export const fieldSchema = schemaWrapper(
  new Schema({
    contentType: { type: String, label: 'Content type' },

    contentTypeId: { type: String, label: 'Content type item' },

    type: { type: String, label: 'Type' },
    validation: {
      type: String,
      optional: true,
      label: 'Validation',
    },
    regexValidation: {
      type: String,
      optional: true,
      label: 'Regex validation',
    },
    text: { type: String, label: 'Text' },
    field: { type: String, optional: true, label: 'Field identifier' },
    description: {
      type: String,
      optional: true,
      label: 'Description',
    },
    code: {
      type: String,
      optional: true,
      label: 'Unique code',
    },
    options: {
      type: [String],
      optional: true,
      label: 'Options',
    },
    locationOptions: {
      type: Array,
      optional: true,
      label: 'Location Options',
    },
    objectListConfigs: {
      type: [ObjectListSchema],
      optional: true,
      label: 'object list config',
    },
    optionsValues: {
      type: String,
      label: 'Field Options object',
    },
    isRequired: { type: Boolean, label: 'Is required' },
    isDefinedByErxes: { type: Boolean, label: 'Is defined by erxes' },
    order: { type: Number, label: 'Order' },
    groupId: { type: String, label: 'Field group' },
    isVisible: { type: Boolean, default: true, label: 'Is visible' },
    isVisibleInDetail: {
      type: Boolean,
      default: true,
      label: 'Is group visible in detail',
    },
    canHide: {
      type: Boolean,
      default: true,
      label: 'Can toggle isVisible',
    },
    isVisibleToCreate: {
      type: Boolean,
      default: false,
      label: 'Is visible to create',
    },
    searchable: {
      type: Boolean,
      default: false,
      label: 'Useful for searching',
    },
    lastUpdatedUserId: { type: String, label: 'Last updated by' },
    associatedFieldId: {
      type: String,
      optional: true,
      label: 'Stores custom property fieldId for form field id',
    },
    logics: { type: [logicSchema] },
    column: { type: Number, optional: true },
    logicAction: {
      type: String,
      label:
        'If action is show field will appear when logics fulfilled, if action is hide it will disappear when logic fulfilled',
    },
    content: {
      type: String,
      optional: true,
      label: 'Stores html content form of field type with html',
    },
    pageNumber: {
      type: Number,
      optional: true,
      label: 'Number of page',
      min: 1,
    },
    showInCard: {
      type: Boolean,
      default: false,
      optional: true,
      label: 'Show in card',
    },
    productCategoryId: {
      type: String,
      optional: true,
      label: 'Product category',
    },
    relationType: {
      type: String,
      optional: true,
      label: 'Relation type',
    },
    subFieldIds: {
      type: [String],
      optional: true,
      label: 'Sub field ids',
    },
    isDisabled: {
      type: Boolean,
      optional: true,
      label: 'Is Disabled',
    },
  }),
);

export const fieldGroupSchema = schemaWrapper(
  new Schema({
    name: { type: String, label: 'Name' },
    contentType: {
      type: String,
      label: 'Content type',
    },
    order: { type: Number, label: 'Order' },
    isDefinedByErxes: {
      type: Boolean,
      default: false,
      label: 'Is defined by erxes',
    },
    description: { type: String, label: 'Description' },
    parentId: { type: String, label: 'Parent Group ID', optional: true },
    code: {
      type: String,
      optional: true,
      label: 'Unique code',
    },
    lastUpdatedUserId: { type: String, label: 'Last updated by' },
    isMultiple: { type: Boolean, default: false, label: 'Is multiple' },
    isVisible: { type: Boolean, default: true, label: 'Is visible' },
    isVisibleInDetail: {
      type: Boolean,
      default: true,
      label: 'Is group visible in detail',
    },
    alwaysOpen: {
      type: Boolean,
      default: false,
      label: 'Always open',
    },
    config: { type: Object },

    logics: { type: [logicSchema] },

    logicAction: {
      type: String,
      label:
        'If action is show field will appear when logics fulfilled, if action is hide it will disappear when logic fulfilled',
    },
  }),
);
