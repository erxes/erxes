import { Document, Schema } from 'mongoose';
import { ACTIVITY_CONTENT_TYPES } from './constants';
import { field, schemaWrapper } from './utils';

export interface ICondition {
  field: string;
  operator: string;
  type: string;
  value?: string;
  brandId?: string;
  dateUnit?: string;
}

export interface IConditionDocument extends ICondition, Document {}

export interface ISegment {
  contentType: string;
  name: string;
  description?: string;
  subOf: string;
  color: string;
  connector: string;
  conditions: ICondition[];
  scopeBrandIds?: string[];
}

export interface ISegmentDocument extends ISegment, Document {
  _id: string;
}

// Mongoose schemas =======================

export const conditionSchema = new Schema(
  {
    field: field({ type: String, label: 'Field' }),
    operator: field({ type: String, label: 'Operator' }),
    type: field({ type: String, label: 'Type' }),

    value: field({
      type: String,
      optional: true,
      label: 'Value',
    }),

    dateUnit: field({
      type: String,
      optional: true,
      label: 'Date unit',
    }),

    brandId: field({
      type: String,
      optional: true,
      label: 'Brand',
    }),
  },
  { _id: false },
);

export const segmentSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    contentType: field({
      type: String,
      enum: ACTIVITY_CONTENT_TYPES.ALL,
      label: 'Content type',
    }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    subOf: field({ type: String, optional: true, label: 'Parent segment' }),
    color: field({ type: String, label: 'Color code' }),
    connector: field({ type: String, label: 'Connector' }),
    conditions: field({ type: [conditionSchema], label: 'Conditions' }),
  }),
);
