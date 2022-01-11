import { Document, Schema } from 'mongoose';
import {
  attachmentSchema,
  commonItemFieldsSchema,
  IItemCommonFields
} from './boards';
import { customFieldSchema, ICustomField } from './common';
import {
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
  PRODUCT_CATEGORY_STATUSES,
  PRODUCT_SUPPLY
} from './constants';

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
  attachment?: any;
  attachmentMore?: any[];
  status?: string;
  supply?: string;
  productCount?: number;
  minimiumCount?: number;
  vendorId?: string;
  vendorCode?: string;

  mergedIds?: string[];
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
  vendor?: ICompany;
}

export interface IProductCategory {
  name: string;
  code: string;
  order: string;
  description?: string;
  parentId?: string;
  attachment?: any;
  status?: string;
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
    tagIds: field({
      type: [String],
      optional: true,
      label: 'Tags',
      index: true
    }),
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
    }),
    attachment: field({ type: attachmentSchema }),
    attachmentMore: field({ type: [attachmentSchema] }),
    status: field({
      type: String,
      enum: PRODUCT_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true
    }),
    supply: field({
      type: String,
      enum: PRODUCT_SUPPLY.ALL,
      optional: true,
      label: 'Supply',
      default: 'unlimited',
      esType: 'keyword',
      index: true
    }),
    productCount: field({
      type: Number,
      label: 'productCount',
      default: '0'
    }),
    minimiumCount: field({
      type: Number,
      label: 'minimiumCount',
      default: '0'
    }),
    vendorId: field({ type: String, optional: true, label: 'Vendor' }),
    mergedIds: field({ type: [String], optional: true })
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
    attachment: field({ type: attachmentSchema }),
    status: field({
      type: String,
      enum: PRODUCT_CATEGORY_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true
    }),
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
    productId: field({ type: String, esType: 'keyword' }), // Product
    uom: field({ type: String, esType: 'keyword' }), // Units of measurement
    currency: field({ type: String, esType: 'keyword' }), // Currency
    quantity: field({ type: Number, label: 'Quantity' }), // Quantity
    unitPrice: field({ type: Number, label: 'Unit price' }), // Unit price
    taxPercent: field({ type: Number, label: 'Tax percent' }), // Tax percent
    tax: field({ type: Number, label: 'Tax' }), // Tax
    discountPercent: field({ type: Number, label: 'Discount percent' }), // Discount percent
    discount: field({ type: Number, label: 'Discount' }), // Discount
    amount: field({ type: Number, label: 'Amount' }), // Amount
    tickUsed: field({ type: Boolean, label: 'Tick used' }), // TickUsed
    assignUserId: field({ type: String, optional: true, esType: 'keyword' }) // AssignUserId
  },
  { _id: false }
);

export const dealSchema = new Schema({
  ...commonItemFieldsSchema,

  productsData: field({ type: [productDataSchema], label: 'Products' }),
  paymentsData: field({ type: Object, optional: true, label: 'Payments' })
});
