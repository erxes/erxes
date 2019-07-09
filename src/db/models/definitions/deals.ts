import { Document, Schema } from 'mongoose';
import { field } from '../utils';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';
import { PRODUCT_TYPES } from './constants';

export interface IProduct {
  name: string;
  type?: string;
  description?: string;
  sku?: string;
  productId?: string;
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

export interface IDeal extends IItemCommonFields {
  productsData?: IProductData[];
}

export interface IDealDocument extends IDeal, Document {
  _id: string;
}

// Mongoose schemas =======================

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
  ...commonItemFieldsSchema,

  productsData: field({ type: [productDataSchema] }),
});
