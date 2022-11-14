import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';
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
  products: [ISalesLogProduct];
  labels: [string];
}

export interface ISalesLogProduct {
  productId: string;
  intervals: [
    {
      label: string;
      value: number;
    }
  ];
}

export interface ISalesLogDocument extends ISalesLog, Document {
  _id: string;
}

export const SalesLogProduct = {
  productId: field({ type: String }),
  intervals: field({
    type: [
      {
        label: String,
        value: Number
      }
    ]
  })
};

export const salesLogSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    type: field({ type: String, label: 'Type' }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, label: 'Description' }),
    status: field({
      type: String,
      enum: STATUS.ALL,
      default: STATUS.ACTIVE,
      label: 'Status'
    }),
    date: field({ type: String, label: 'Date' }),
    branchId: field({ type: String, label: 'Branch' }),
    departmentId: field({ type: String, label: 'Department' }),
    products: field({
      type: [SalesLogProduct],
      default: [],
      label: 'Products'
    }),
    labels: field({ type: [String], default: [], label: 'Labels' }),
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

export interface IPlanValue {
  [month: string]: number;
}

export interface IYearPlansAddParams {
  year: number;
  departmentId: string;
  branchId: string;
  productCategoryId: string;
  productId: string;
}

export interface IYearPlan {
  year: number;
  departmentId: string;
  branchId: string;
  productId: string;
  uomId: string;
  values: IPlanValue;
}

export interface IYearPlanDocument extends IYearPlan, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  confirmedData?: any;
}

export const yearPlanSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    year: field({ type: Number, label: 'Year' }),
    departmentId: field({ type: String, label: 'Department' }),
    branchId: field({ type: String, label: 'Branch' }),
    productId: field({ type: String, label: 'Product' }),
    uomId: field({ type: String, label: 'Uom' }),
    // jan: field({ type: Number, label: '' }),
    values: field({ type: Object, label: '' }),
    confirmedData: field({
      type: Object,
      optional: true,
      label: 'Confirmed Data'
    }),
    createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
    createdBy: field({ type: String, label: 'Created by' }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified at'
    }),
    modifiedBy: field({ type: String, label: 'Modified by' })
  })
);

export interface IDayPlan {
  date: Date;
  departmentId: string;
  branchId: string;
  productId: string;
  uomId: string;
  values: IPlanValue;
  status: string;
}

export interface IDayPlanDocument extends IDayPlan, Document {
  _id: string;
  createdAt?: Date;
  createdUser?: string;
  modifiedAt?: Date;
  modifiedUser?: string;
}

export const dayPlanSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    date: field({ type: Date, label: 'Year' }),
    departmentId: field({ type: String, label: 'Department' }),
    branchId: field({ type: String, label: 'Branch' }),
    productId: field({ type: String, label: 'Product' }),
    uomId: field({ type: String, label: 'Uom' }),
    // jan: field({ type: Number, label: '' }),
    values: field({ type: Object, label: '' }),
    status: field({ type: String, label: 'Status' }),
    createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
    createdBy: field({ type: String, label: 'Created by' }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified at'
    }),
    modifiedBy: field({ type: String, label: 'Modified by' })
  })
);
