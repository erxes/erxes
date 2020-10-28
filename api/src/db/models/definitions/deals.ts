import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';
import { customFieldSchema, ICustomField } from './common';
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
  customFieldsData?: ICustomField[];
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

export interface IProductData extends Document {
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
  tickUsed?: boolean;
  assignUserId?: string;
}

interface IPaymentsData {
  [key: string]: {
    currency?: string;
    amount?: number;
  };
}

export interface IDeal extends IItemCommonFields {
  productsData?: IProductData[];
  paymentsData?: IPaymentsData[];
}

export interface IDealDocument extends IDeal, Document {
  _id: string;
}

// Mongoose schemas =======================

export const productSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    categoryId: field({ type: String, label: 'Category' }),
    type: field({
      type: String,
      enum: PRODUCT_TYPES.ALL,
      default: PRODUCT_TYPES.PRODUCT,
      label: 'Type'
    }),
    tagIds: field({ type: [String], optional: true, label: 'Tags' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    sku: field({ type: String, optional: true, label: 'Stock keeping unit' }),
    unitPrice: field({ type: Number, optional: true, label: 'Unit price' }),
    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data'
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    })
  })
);

export const productCategorySchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    order: field({ type: String, label: 'Order' }),
    parentId: field({ type: String, optional: true, label: 'Parent' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    })
  })
);

export const productDataSchema = new Schema(
  {
    _id: field({ type: String }),
    productId: field({ type: String, label: 'Product' }),
    uom: field({ type: String, label: 'Units of measurement' }),
    currency: field({ type: String, label: 'Currency' }),
    quantity: field({ type: Number, label: 'Quantity' }),
    unitPrice: field({ type: Number, label: 'Unit price' }),
    taxPercent: field({ type: Number, label: 'Tax percent' }),
    tax: field({ type: Number, label: 'Tax' }),
    discountPercent: field({ type: Number, label: 'Discount percent' }),
    discount: field({ type: Number, label: 'Discount' }),
    amount: field({ type: Number, label: 'Amount' }),
    tickUsed: field({ type: Boolean, label: 'TickUsed' }),
    assignUserId: field({ type: String, label: 'AssignUserId' })
  },
  { _id: false }
);

export const dealSchema = schemaWrapper(
  new Schema({
    ...commonItemFieldsSchema,

    productsData: field({ type: [productDataSchema], label: 'Products' }),
    paymentsData: field({ type: Object, optional: true, label: 'Payments' })
  })
);
