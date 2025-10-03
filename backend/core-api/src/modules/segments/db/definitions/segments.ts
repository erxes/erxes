import { schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

export interface IAttributeFilter {
  name: string;
  operator: string;
  value: string;
}

export interface ICondition {
  type: 'property' | 'event' | 'subSegment';

  propertyType?: string;
  propertyName?: string;
  propertyOperator?: string;
  propertyValue?: string;

  eventName?: string;
  eventOccurrence?: 'exactly' | 'atleast' | 'atmost';
  eventOccurenceValue?: number;
  eventAttributeFilters?: IAttributeFilter[];

  subSegmentId?: string;
  subSegmentForPreview?: ISegment;

  config?: any;
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

  config?: any;
}

export interface ISegmentDocument extends ISegment, Document {
  _id: string;
}

// Mongoose schemas =======================
const eventAttributeSchema = new Schema(
  {
    name: { type: String },
    operator: { type: String },
    value: { type: String },
  },
  { _id: false },
);

export const conditionSchema = new Schema(
  {
    type: { type: String },

    propertyType: {
      type: String,
      optional: true,
    },

    propertyName: {
      type: String,
      optional: true,
    },

    propertyOperator: {
      type: String,
      optional: true,
    },

    propertyValue: {
      type: String,
      optional: true,
    },

    eventName: {
      type: String,
      optional: true,
    },

    eventOccurrence: {
      type: String,
      optional: true,
    },

    eventOccurenceValue: {
      type: Number,
      optional: true,
    },

    eventAttributeFilters: { type: [eventAttributeSchema] },

    subSegmentId: { type: String, optional: true },

    config: {
      type: Object,
      optional: true,
    },
  },
  { _id: false },
);

export const segmentSchema = schemaWrapper(
  new Schema({
    contentType: {
      type: String,
      label: 'Content type',
      index: true,
    },
    name: { type: String, optional: true },
    description: { type: String, optional: true },
    subOf: { type: String, optional: true, index: true },
    color: { type: String },
    shouldWriteActivityLog: {
      type: Boolean,
      optional: true,
    },

    conditionsConjunction: {
      type: String,
      enum: ['and', 'or'],
      default: 'and',
      label: 'Conjunction',
    },

    conditions: { type: [conditionSchema] },

    config: {
      type: Object,
      optional: true,
    },
  }),
);
