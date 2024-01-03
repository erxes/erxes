import { Document, Schema } from 'mongoose';

import { attachmentSchema } from '@erxes/api-utils/src/types';

import { DURATION_TYPES, JOB_TYPES } from './constants';
import { field, schemaHooksWrapper } from './utils';

export interface IProduct {
  name: string;
  categoryId?: string;
  categoryCode?: string;
  type?: string;
  description?: string;
  unitPrice?: number;
  code: string;
  barcodes: string[];
  productId?: string;
  tagIds?: string[];
  attachment?: any;
  attachmentMore?: any[];
  status?: string;
  vendorId?: string;
  vendorCode?: string;

  mergedIds?: string[];

  uom?: string;
  subUoms?: any[];
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
}

export interface IProductsData {
  _id: string;
  productId: string;
  quantity: number;
  amount?: number;
  uom: string;
  series?: string[];

  product?: IProduct;
}

export interface IProductsDataDocument extends IProductsData {}

export interface IUom {
  code: string;
  name: string;
}

export interface IUomDocument extends IUom, Document {
  _id: string;
  createdAt: Date;
}

export interface IBranch {
  title: string;
  address?: string;
  supervisorId?: string;
  parentId?: string;
  userIds?: string[];
}

export interface IBranchDocument extends IBranch, Document {
  _id: string;
}

export interface IDepartment {
  title: string;
  description?: string;
  supervisorId?: string;
  parentId?: string;
  userIds?: string[];
}

export interface IDepartmentDocument extends IDepartment, Document {
  _id: string;
}
export interface IJobRefer {
  categoryId: string;
  code: string;
  name: string;
  type: string;
  status: string;
  createdAt?: Date;
  duration?: number;
  durationType?: string;
  needProducts?: IProductsData[];
  resultProducts?: IProductsData[];
}

export interface IJobReferDocument extends IJobRefer, Document {
  _id: string;
  createdAt: Date;
  needProducts?: IProductsData[];
  resultProducts?: IProductsData[];
}

export const productsDataSchema = new Schema({
  _id: field({ pkey: true }),
  productId: field({ type: String, label: 'Product' }),
  quantity: field({ type: Number, label: 'Quantity' }),
  amount: field({ type: Number, optional: true, label: 'Quantity' }),
  uom: field({ type: String, label: 'UOM' }),
  proportion: field({ type: Number, optional: true }),
  branchId: field({ type: String, optional: true, label: 'Branch' }),
  departmentId: field({ type: String, optional: true, label: 'Department' }),
  series: field({ type: [String], optional: true, label: 'Series' })
});

export const jobReferSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    categoryId: field({ type: String, label: 'Category', index: true }),
    code: field({ type: String, label: 'Code', index: true }),
    name: field({ type: String, label: 'Name' }),
    attachment: field({ type: attachmentSchema }),
    type: field({
      type: String,
      enum: JOB_TYPES.ALL,
      label: 'Type'
    }),
    status: field({ type: String, label: 'Status' }),
    createdAt: field({ type: Date, label: 'Created at' }),
    duration: field({ type: Number, label: 'Duration value' }),
    durationType: field({
      type: String,
      enum: DURATION_TYPES.ALL,
      default: DURATION_TYPES.HOUR,
      label: 'Duration value'
    }),
    needProducts: field({
      type: [productsDataSchema],
      optional: true,
      label: 'Need products'
    }),
    resultProducts: field({
      type: [productsDataSchema],
      optional: true,
      label: 'Result products'
    })
  }),
  'erxes_jobRefers'
);

// for tags query. increases search speed, avoids in-memory sorting
jobReferSchema.index({ status: 1 });
