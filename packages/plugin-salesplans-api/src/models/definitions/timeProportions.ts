import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IPercentValue {
  _id: string;
  timeId: string;
  percent: number;
}

export interface ITimeProportionsAddParams {
  departmentIds: string[];
  branchIds: string[];
  productCategoryId: string;
  percents: IPercentValue[];
}

export interface ITimeProportion {
  date: Date;
  departmentId: string;
  branchId: string;
  productCategoryId: string;
  percents: IPercentValue[];
}

export interface ITimeProportionDocument extends ITimeProportion, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
}

const percentSchema = new Schema({
  _id: field({ pkey: true }),
  timeId: field({ type: String, label: 'time frame' }),
  percent: field({ type: Number, label: 'percent' })
});

export const timeProportionSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    departmentId: field({ type: String, label: 'Department' }),
    branchId: field({ type: String, label: 'Branch' }),
    productCategoryId: field({ type: String, label: 'Product Category' }),
    percents: field({ type: [percentSchema], label: '' }),
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
