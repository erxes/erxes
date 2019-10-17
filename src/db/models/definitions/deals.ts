import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';
import { PRODUCT_TYPES } from './constants';
import { field, schemaWrapper } from './utils';

export interface IProduct {
  name: string;
  categoryId?: string;
  categoryCode?: string;
  type?: string;
  description?: string;
  sku?: string;
  unitPrice?: number;
  code: string;
  customFieldsData?: any;
  productId?: string;
  tagIds?: string[];
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
}

export interface IProductCategory {
  name: string;
  code: string;
  order: string;
  description?: string;
  parentId?: string;
}

export interface IProductCategoryDocument extends IProductCategory, Document {
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

export interface IDeal extends IItemCommonFields {
  productsData?: IProductData[];
}

export interface IDealDocument extends IDeal, Document {
  _id: string;
}

// Mongoose schemas =======================

export const productSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String }),
    code: field({ type: String, unique: true }),
    categoryId: field({ type: String }),
    type: field({
      type: String,
      enum: PRODUCT_TYPES.ALL,
      default: PRODUCT_TYPES.PRODUCT,
    }),
    tagIds: field({ type: [String], optional: true }),
    description: field({ type: String, optional: true }),
    sku: field({ type: String, optional: true }), // Stock Keeping Unit
    unitPrice: field({ type: Number, optional: true }),
    customFieldsData: field({
      type: Object,
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
    }),
  }),
);

export const productCategorySchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String }),
    code: field({ type: String, unique: true }),
    order: field({ type: String }),
    parentId: field({ type: String, optional: true }),
    description: field({ type: String, optional: true }),
    createdAt: field({
      type: Date,
      default: new Date(),
    }),
  }),
);

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
  ...commonItemFieldsSchema,

  productsData: field({ type: [productDataSchema] }),
});
