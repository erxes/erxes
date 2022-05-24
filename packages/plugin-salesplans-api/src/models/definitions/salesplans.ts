import { field, schemaWrapper } from './utils';
import { Schema, Document } from 'mongoose';

export const STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ARCHIVED: 'archived',
  ALL: ['active', 'disabled', 'archived']
};

export interface ISalesLog {
  type: string;
  name: string;
  description: string;
  status: string;
  date: Date;
  branchId: string;
  unitId: string;
  createdBy: string;
}

export interface ISalesLogDocument extends ISalesLog, Document {
  _id: string;
  createdAt: Date;
}

export const salesLogSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    type: field({ type: String, label: 'Type' }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, label: 'Description' }),
    status: field({
      type: String,
      enum: STATUSES.ALL,
      default: 'active',
      label: 'Status'
    }),
    date: field({ type: String, label: 'Date' }),
    branchId: field({ type: String, label: 'Branch' }),
    unitId: field({ type: String, label: 'Unit' }),
    createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
    createdBy: field({ type: String, label: 'Created by' })
  })
);

export interface ILabel {
  title: string;
  color: string;
  type: string;
  status: string;
}

export interface ILabelDocument extends ILabel, Document {
  _id: string;
}

export const labelSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String, label: 'Title' }),
    color: field({ type: String, label: 'Color' }),
    type: field({ type: String, label: 'Type' }),
    status: field({
      type: String,
      enum: STATUSES.ALL,
      default: 'active',
      label: 'Status'
    })
  })
);

export interface ITimeframe {
  name: string;
  description: string;
  startTime: number;
  endTime: number;
}

export interface ITimeframeDocument extends ITimeframe, Document {
  _id: string;
}

export const timeframeSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, label: 'Description' }),
    startTime: field({ type: Number, label: 'Start time' }),
    endTime: field({ type: Number, label: 'End time' })
  })
);

export interface IDayPlanConfig {
  salesLogId: string;
  timeframeId: string;
  labelIds: string[];
}

export interface IDayPlanConfigDocument extends IDayPlanConfig, Document {
  _id: string;
}

export const dayPlanConfigSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    salesLogId: field({ type: String, label: 'SalesLog' }),
    timeframeId: field({ type: String, label: 'Timeframe' }),
    labelIds: field({ type: String, label: 'Labels' })
  })
);

export interface IMonthPlanConfig {
  salesLogId: string;
  day: Date;
  labelIds: string[];
}

export interface IMonthPlanConfigDocument extends IMonthPlanConfig, Document {
  _id: string;
}

export const monthPlanConfigSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    salesLogId: field({ type: String, label: 'SalesLog' }),
    day: field({ type: Date, label: 'Day' }),
    labelIds: field({ type: String, label: 'Labels' })
  })
);

export interface IYearPlanConfig {
  salesLogId: string;
  month: number;
  labelIds: string[];
}

export interface IYearPlanConfigDocument extends IYearPlanConfig, Document {
  _id: string;
}

export const yearPlanConfigSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    salesLogId: field({ type: String, label: 'SalesLog' }),
    month: field({ type: Number, label: 'Month' }),
    labelIds: field({ type: String, label: 'Labels' })
  })
);
