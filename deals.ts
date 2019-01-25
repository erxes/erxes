import { Document, Schema } from 'mongoose';
import { field } from '../utils';
import { PROBABILITY, PRODUCT_TYPES } from './constants';

interface ICommonFields {
  userId?: string;
  createdAt?: Date;
  order?: number;
}

export interface IBoard extends ICommonFields {
  name?: string;
  isDefault?: boolean;
}

export interface IBoardDocument extends IBoard, Document {
  _id: string;
}

export interface IPipeline extends ICommonFields {
  name?: string;
  boardId?: string;
}

export interface IPipelineDocument extends IPipeline, Document {
  _id: string;
}

export interface IStage extends ICommonFields {
  name?: string;
  probability?: string;
  pipelineId?: string;
}

export interface IStageDocument extends IStage, Document {
  _id: string;
}

export interface IProduct {
  name: string;
  type?: string;
  description?: string;
  sku?: string;
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
}

interface IProductData extends Document {
  productId: string;
  uom: string;
  currency: string;
  quantity: number;
  unitPrice: number;
  taxPercent?: number;
  tax?: number;
  discountPercent?: number;
  discount?: number;
  amount?: number;
}

export interface IDeal extends ICommonFields {
  name?: string;
  productsData?: IProductData[];
  companyIds?: string[];
  customerIds?: string[];
  closeDate?: Date;
  description?: string;
  assignedUserIds?: string[];
  stageId?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
}

export interface IDealDocument extends IDeal, ICommonFields, Document {
  _id: string;
}

// Mongoose schemas =======================
const commonFieldsSchema = {
  userId: field({ type: String }),
  createdAt: field({
    type: Date,
    default: new Date(),
  }),
  order: field({ type: Number }),
};

export const boardSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  isDefault: field({
    type: Boolean,
    default: false,
  }),
  ...commonFieldsSchema,
});

export const pipelineSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  boardId: field({ type: String }),
  ...commonFieldsSchema,
});

export const stageSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  probability: field({
    type: String,
    enum: PROBABILITY.ALL,
  }), // Win probability
  pipelineId: field({ type: String }),
  ...commonFieldsSchema,
});

export const productSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  type: field({
    type: String,
    enum: PRODUCT_TYPES.ALL,
    default: PRODUCT_TYPES.PRODUCT,
  }),
  description: field({ type: String, optional: true }),
  sku: field({ type: String, optional: true }), // Stock Keeping Unit
  createdAt: field({
    type: Date,
    default: new Date(),
  }),
});

const productDataSchema = new Schema(
  {
    _id: field({ type: String }),
    productId: field({ type: String }),
    uom: field({ type: String }), // Units of measurement
    currency: field({ type: String }),
    quantity: field({ type: Number }),
    unitPrice: field({ type: Number }),
    taxPercent: field({ type: Number }),
    tax: field({ type: Number }),
    discountPercent: field({ type: Number }),
    discount: field({ type: Number }),
    amount: field({ type: Number }),
  },
  { _id: false },
);

export const dealSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  productsData: field({ type: [productDataSchema] }),
  companyIds: field({ type: [String] }),
  customerIds: field({ type: [String] }),
  closeDate: field({ type: Date }),
  description: field({ type: String, optional: true }),
  assignedUserIds: field({ type: [String] }),
  stageId: field({ type: String }),
  modifiedAt: field({
    type: Date,
    default: new Date(),
  }),
  modifiedBy: field({ type: String }),
  ...commonFieldsSchema,
});
