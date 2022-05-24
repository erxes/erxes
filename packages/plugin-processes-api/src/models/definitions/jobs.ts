import { Document, Schema } from 'mongoose';

import { attachmentSchema } from '@erxes/api-utils/src/types';
import { IBranch, IDepartment } from '@erxes/ui-team/src/types';
import {
  IProduct,
  productSchema
} from '@packages/plugin-products-api/src/models/definitions/products';
import { IUom } from '@packages/plugin-products-api/src/models/definitions/uoms';

import { DURATION_TYPES, JOB_TYPES } from './constants';
import { field, schemaHooksWrapper, schemaWrapper } from './utils';

export interface IProductsData {
  _id: string;
  productId: string;
  quantity: number;
  uomId: string;
  branchId: string;
  departmentId: string;
}

export interface IProductsDataDocument extends IProductsData {
  product: IProduct;
  branch?: IBranch;
  department?: IDepartment;
  uom?: IUom;
}

export interface IJobRefer {
  categoryId: string;
  code: string;
  name: string;
  type: string;
  status: string;
  createdAt: Date;
  duration: number;
  durationType: string;
}

export interface IJobReferDocument extends IJobRefer, Document {
  _id: string;
  createdAt: Date;
  needProducts: any[];
  resultProducts: any[];
}

export const productsDataSchema = new Schema({
  _id: field({ pkey: true }),
  productId: field({ type: String, label: 'Product' }),
  product: field({ type: Object }),
  quantity: field({ type: Number, label: 'Quantity' }),
  uomId: field({ type: String, label: 'UOM' }),
  branchId: field({ type: String, optional: true, label: 'Branch' }),
  departmentId: field({ type: String, optional: true, label: 'Department' })
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
