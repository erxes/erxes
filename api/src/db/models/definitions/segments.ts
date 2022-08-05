import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export const CONTENT_TYPES = {
  CUSTOMER: 'customer',
  LEAD: 'lead',
  VISITOR: 'visitor',
  COMPANY: 'company',
  DEAL: 'deal',
  TASK: 'task',
  TICKET: 'ticket',
  CONVERSATION: 'conversation',
  USER: 'user',

  ALL: [
    'customer',
    'lead',
    'visitor',
    'company',
    'deal',
    'task',
    'ticket',
    'conversation',
    'user'
  ]
};

export interface IAttributeFilter {
  name: string;
  operator: string;
  value: string;
}

export interface ICondition {
  type: 'property' | 'event' | 'subSegment';

  propertyType?:
    | 'customer'
    | 'company'
    | 'deal'
    | 'task'
    | 'task'
    | 'ticket'
    | 'form_submission'
    | 'conversation'
    | 'user';
  propertyName?: string;
  propertyOperator?: string;
  propertyValue?: string;

  eventName?: string;
  eventOccurence?: 'exactly' | 'atleast' | 'atmost';
  eventOccurenceValue?: number;
  eventAttributeFilters?: IAttributeFilter[];

  subSegmentId?: string;
  subSegmentForPreview?: ISegment;

  pipelineId?: string;
  boardId?: string;

  formId?: string;
}

export interface IConditionDocument extends ICondition, Document {}

export interface ISegment {
  _id?: string;
  contentType: string;
  name: string;
  description?: string;
  subOf?: string;
  color?: string;
  shouldWriteActivityLog: boolean;

  conditions: ICondition[];
  conditionsConjunction?: 'and' | 'or';

  scopeBrandIds?: string[];

  boardId?: string;
  pipelineId?: string;
}

export interface ISegmentDocument extends ISegment, Document {
  _id: string;
}

// Mongoose schemas =======================
const eventAttributeSchema = new Schema(
  {
    name: field({ type: String }),
    operator: field({ type: String }),
    value: field({ type: String })
  },
  { _id: false }
);

export const conditionSchema = new Schema(
  {
    type: field({ type: String }),

    propertyType: field({
      type: String,
      optional: true
    }),

    propertyName: field({
      type: String,
      optional: true
    }),

    propertyOperator: field({
      type: String,
      optional: true
    }),

    propertyValue: field({
      type: String,
      optional: true
    }),

    eventName: field({
      type: String,
      optional: true
    }),

    eventOccurence: field({
      type: String,
      optional: true
    }),

    eventOccurenceValue: field({
      type: Number,
      optional: true
    }),

    eventAttributeFilters: field({ type: [eventAttributeSchema] }),

    subSegmentId: field({ type: String, optional: true }),

    pipelineId: field({
      type: String,
      optional: true
    }),

    boardId: field({
      type: String,
      optional: true
    }),

    formId: field({
      type: String,
      optional: true
    })
  },
  { _id: false }
);

export const segmentSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    contentType: field({
      type: String,
      enum: CONTENT_TYPES.ALL,
      label: 'Content type',
      index: true
    }),
    name: field({ type: String, optional: true }),
    description: field({ type: String, optional: true }),
    subOf: field({ type: String, optional: true, index: true }),
    color: field({ type: String }),
    shouldWriteActivityLog: field({
      type: Boolean,
      required: true,
      default: false
    }),

    conditionsConjunction: field({
      type: String,
      enum: ['and', 'or'],
      default: 'and',
      label: 'Conjunction'
    }),

    conditions: field({ type: [conditionSchema] }),

    boardId: field({ type: String, optional: true }),
    pipelineId: field({ type: String, optional: true })
  })
);
