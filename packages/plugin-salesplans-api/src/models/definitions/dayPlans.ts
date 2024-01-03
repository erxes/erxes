import { Document, Schema } from 'mongoose';
import { DAYPLAN_STATUS } from '../../constants';
import { field, schemaWrapper } from './utils';

export interface IPlanValue {
  _id: string;
  timeId: string;
  count: number;
}

export interface IDayPlan {
  date: Date;
  departmentId: string;
  branchId: string;
  productId: string;
  uom: string;
  planCount: number;
  values: IPlanValue[];
  status: string;
}

export interface IDayPlansAddParams {
  date: Date;
  departmentId: string;
  branchId: string;
  productCategoryId: string;
  productId: string;
}

export interface IDayPlanConfirmParams {
  date: Date;
  branchId: string;
  departmentId: string;
  productCategoryId: string;
  productId: string;
  ids: string[];
}

export interface IDayPlanDocument extends IDayPlan, Document {
  _id: string;
  createdAt?: Date;
  createdUser?: string;
  modifiedAt?: Date;
  modifiedUser?: string;
}

const valueSchema = new Schema({
  _id: field({ pkey: true }),
  timeId: field({ type: String, label: 'time frame' }),
  count: field({ type: Number, label: 'count' })
});

export const dayPlanSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    date: field({ type: Date, label: 'Year' }),
    departmentId: field({ type: String, label: 'Department' }),
    branchId: field({ type: String, label: 'Branch' }),
    productId: field({ type: String, label: 'Product' }),
    uom: field({ type: String, label: 'Uom' }),
    planCount: field({ type: Number, label: 'Plan count' }),
    values: field({ type: [valueSchema], label: '' }),
    status: field({
      type: String,
      enum: DAYPLAN_STATUS.ALL,
      default: DAYPLAN_STATUS.NEW,
      label: 'Status'
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
