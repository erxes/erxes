import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';
import { IPlanValue } from './yearPlans';

export interface IDayPlan {
  date: Date;
  departmentId: string;
  branchId: string;
  productId: string;
  uomId: string;
  values: IPlanValue;
  status: string;
}

export interface IDayPlansAddParams {
  date: Date;
  departmentId: string;
  branchId: string;
  productCategoryId: string;
  productId: string;
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
