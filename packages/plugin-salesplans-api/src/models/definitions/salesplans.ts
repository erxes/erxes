import { field, schemaWrapper } from './utils';
import { Schema, Document } from 'mongoose';
import { STATUS } from '../../constants';

export interface ISalesLog {
  name: string;
  description: string;
  status: string;
  type: string;
  date: Date;
  branchId: string;
  departmentId: string;
  createdBy: string;
}

export interface ISalesLogDocument extends ISalesLog, Document {
  _id: string;
}

export const salesLogSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    type: field({ type: String, label: 'Type' }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, label: 'Description' }),
    status: field({
      type: String,
      enum: STATUS.ALL,
      default: 'active',
      label: 'Status'
    }),
    date: field({ type: String, label: 'Date' }),
    branchId: field({ type: String, label: 'Branch' }),
    departmentId: field({ type: String, label: 'Department' }),
    createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
    createdBy: field({ type: String, label: 'Created by' })
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
    labelIds: field({ type: [String], label: 'Labels' })
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
    day: field({ type: Number, label: 'Day' }),
    labelIds: field({ type: [String], label: 'Labels' })
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
    labelIds: field({ type: [String], label: 'Labels' })
  })
);
