import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IPlanValues {
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
  year?: number;
  departmentId?: string;
  branchId?: string;
  productId?: string;
  uom?: string;
  values?: IPlanValues;
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
    uom: field({ type: String, label: 'Uom' }),
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
