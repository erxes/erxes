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
  USER: 'user',

  ALL: [
    'customer',
    'lead',
    'visitor',
    'company',
    'deal',
    'task',
    'ticket',
    'user'
  ]
};

export interface IAttributeFilter {
  name: string;
  operator: string;
  value: string;
}

export interface ICondition {
  type: 'property' | 'event';

  propertyName?: string;
  propertyOperator?: string;
  propertyValue?: string;

  eventName?: string;
  eventOccurence?: 'exactly' | 'atleast' | 'atmost';
  eventOccurenceValue?: number;
  eventAttributeFilters?: IAttributeFilter[];
}

export interface IConditionDocument extends ICondition, Document {}

export interface ISegment {
  _id?: string;
  contentType: string;
  name: string;
  description?: string;
  subOf: string;
  color: string;
  conditions: ICondition[];
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

    eventAttributeFilters: field({ type: [eventAttributeSchema] })
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
    name: field({ type: String }),
    description: field({ type: String, optional: true }),
    subOf: field({ type: String, optional: true, index: true }),
    color: field({ type: String }),
    conditions: field({ type: [conditionSchema] }),

    boardId: field({ type: String }),
    pipelineId: field({ type: String })
  })
);
