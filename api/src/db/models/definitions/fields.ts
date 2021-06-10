import { Document, Schema } from 'mongoose';
import { FIELDS_GROUPS_CONTENT_TYPES } from './constants';
import { field, schemaWrapper } from './utils';

export interface ISubmission {
  _id: string;
  value: any;
  type?: string;
  validation?: string;
  associatedFieldId?: string;
  stageId?: string;
  groupId?: string;
  column?: string;
}
export interface ILogic {
  fieldId: string;
  tempFieldId?: string;
  logicOperator?: string;
  logicValue?: string | number | Date | string[];
  logicAction: string;
}

export interface IAction extends ILogic {
  tagIds?: string[];
  stageId?: string;
  itemId?: string;
  itemName?: string;
}

const LogicSchema = (fields?: any) => {
  const schema = new Schema(
    {
      fieldId: field({ type: String }),
      logicOperator: field({
        type: String,
        optional: true
      }),
      logicValue: field({
        type: Schema.Types.Mixed,
        optional: true
      }),
      logicAction: field({
        type: String,
        label:
          'If action is show field will appear when logics fulfilled, if action is hide it will disappear when logic fulfilled'
      })
    },
    { _id: false }
  );

  if (fields) {
    schema.add(fields);
  }

  return schema;
};

export const logicSchema = LogicSchema();

export const actionSchema = LogicSchema({
  tagIds: field({
    type: [String],
    optional: true
  }),
  stageId: field({
    type: String,
    optional: true
  }),
  itemId: field({
    type: String,
    optional: true
  }),
  itemName: field({
    type: String,
    optional: true
  })
});

export const boardsPipelinesSchema = new Schema(
  {
    boardId: field({ type: String, optional: true }),
    pipelineIds: field({
      type: [String],
      optional: true
    })
  },
  { _id: false }
);

interface IVisibility {
  isVisible?: boolean;
  isVisibleInDetail?: boolean;
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
  isRequired?: boolean;
  isDefinedByErxes?: boolean;
  order?: number;
  groupId?: string;
  canHide?: boolean;
  lastUpdatedUserId?: string;
  associatedFieldId?: string;
  logicAction?: string;
  logics?: ILogic[];
  actions?: IAction[];
  tempFieldId?: string;
  column?: string;
  groupName?: string;
  pageNumber?: number;

  stageId?: string;
  hasCustomOptions?: boolean;
}

export interface IFieldDocument extends IField, Document {
  _id: string;
}

interface IBoardsPipelines {
  boardId?: string;
  pipelineIds?: string[];
}

export interface IFieldGroup extends IVisibility {
  name?: string;
  contentType?: string;
  order?: number;
  isDefinedByErxes?: boolean;
  description?: string;
  lastUpdatedUserId?: string;
  boardsPipelines?: IBoardsPipelines[];
  boardIds?: string[];
  pipelineIds?: string[];
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
    hasCustomOptions: field({
      type: Boolean,
      default: false,
      label: 'hasCustomOptions'
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
    lastUpdatedUserId: field({ type: String, label: 'Last updated by' }),
    associatedFieldId: field({
      type: String,
      optional: true,
      label: 'Stores custom property fieldId for form field id'
    }),
    logics: field({ type: [logicSchema] }),
    actions: field({ type: [actionSchema] }),
    column: field({ type: String, optional: true }),
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
    stageId: field({
      type: String,
      optional: true,
      label: 'Stage id of associated form field'
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
    isVisible: field({ type: Boolean, default: true, label: 'Is visible' }),
    isVisibleInDetail: field({
      type: Boolean,
      default: true,
      label: 'Is group visible in detail'
    }),
    boardsPipelines: field({
      type: [boardsPipelinesSchema],
      optional: true
    }),
    boardIds: field({ type: [String], label: 'board ids', optional: true }),
    pipelineIds: field({
      type: [String],
      label: 'pipeline ids',
      optional: true
    })
  })
);
