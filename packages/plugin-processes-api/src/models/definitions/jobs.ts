import { attachmentSchema } from '@erxes/api-utils/src/types';
import { Document, Schema } from 'mongoose';
import { DURATION_TYPES } from './constants';
import { field, schemaHooksWrapper, schemaWrapper } from './utils';
import {
  IBranch,
  IDepartment
} from '../../../../../../../temp/erxes/ui/src/modules/settings/team/types';
import { IUom } from '../../../../plugin-products-api/src/models/definitions/uoms';
import { IProduct } from '@packages/plugin-products-api/src/models/definitions/products';

export interface IProductsData {
  id: string;
  productId: string;
  quantity: number;
  uimId: string;
  branchId: string;
  departmentId: string;
}

export interface IProductsDataDocument extends IProductsData {
  product: IProduct;
  branch: IBranch;
  department: IDepartment;
  uom: IUom;
}

export interface IJobRefer {
  code: string;
  name: string;
  type: string;
  status: string;
  createdAt: Date;
  duration: number;
  durationType: string;
  needProducts: IProductsData;
  resultProducts: IProductsData;
}

export interface IJobReferDocument extends IJobRefer, Document {
  _id: string;
  createdAt: Date;
  needProducts: IProductsDataDocument;
  resultProducts: IProductsDataDocument;
}

export const productsDataSchema = new Schema({
  _id: field({ pkey: true }),
  productId: field({ type: String, label: 'Product' }),
  quantity: field({ type: Number, label: 'Quantity' }),
  uomId: field({ type: String, label: 'UOM' }),
  branchId: field({ type: String, label: 'Branch' }),
  departmentId: field({ type: String, label: 'Department' })
});

export const jobReferSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    categoryId: field({ type: String, label: 'Category', index: true }),
    code: field({ type: String, label: 'Code', index: true }),
    name: field({ type: String, label: 'Name' }),
    attachment: field({ type: attachmentSchema }),
    type: field({ type: String, label: 'Type' }),
    status: field({ type: String, label: 'Status' }),
    createdAt: field({ type: Date, label: 'Created at' }),
    duration: field({ type: Number, label: 'Duration value' }),
    durationType: field({
      type: String,
      enum: DURATION_TYPES.ALL,
      default: DURATION_TYPES.HOUR,
      label: 'Duration value'
    }),
    needProducts: field({ type: productsDataSchema, label: 'Need products' }),
    resultProducts: field({
      type: productsDataSchema,
      label: 'Result products'
    })
  }),
  'erxes_jobRefers'
);

// for tags query. increases search speed, avoids in-memory sorting
jobReferSchema.index({ status: 1 });
