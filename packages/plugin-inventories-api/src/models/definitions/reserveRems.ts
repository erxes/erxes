import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IReserveRemsAddParams {
  departmentIds: string[];
  branchIds: string[];
  productCategoryId: string;
  productId: string;
  remainder: number;
}

export interface IReserveRem {
  departmentId: string;
  branchId: string;
  productId: string;
  uom: string;
  remainder: number;
}

export interface IReserveRemDocument extends IReserveRem, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  confirmedData?: any;
}

export const reserveRemSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    departmentId: field({ type: String, label: 'Department' }),
    branchId: field({ type: String, label: 'Branch' }),
    productId: field({ type: String, label: 'product' }),
    uom: field({ type: String, label: 'Uom' }),
    remainder: field({ type: Number, label: 'Remainder' }),
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
