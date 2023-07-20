import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';

import { field } from './utils';

export interface IProductData extends Document {
  productId: string;
  uom: string;
  currency: string;
  quantity: number;
  unitPrice: number;
  globalUnitPrice: number;
  unitPricePercent: number;
  taxPercent?: number;
  tax?: number;
  name?: string;
  vatPercent?: number;
  discountPercent?: number;
  discount?: number;
  amount?: number;
  tickUsed?: boolean;
  isVatApplied?: boolean;
  assignUserId?: string;
  branchId?: string;
  departmentId?: string;
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

export const productDataSchema = new Schema(
  {
    _id: field({ pkey: true }),
    productId: field({ type: String, esType: 'keyword' }), // Product
    name: field({ type: String, esType: 'name' }), // Product name
    uom: field({ type: String, esType: 'keyword' }), // Units of measurement
    currency: field({ type: String, esType: 'keyword' }), // Currency
    quantity: field({ type: Number, label: 'Quantity' }), // Quantity
    maxQuantity: field({ type: Number, label: 'Max' }), // Max quantity when selected bonus voucher
    unitPrice: field({ type: Number, label: 'Unit price' }), // Unit price
    globalUnitPrice: field({ type: Number, label: 'Global unit price' }), // Global unit price
    unitPricePercent: field({ type: Number, label: 'Unit price percent' }), // Unit price percent
    taxPercent: field({ type: Number, label: 'Tax percent' }), // Tax percent
    vatPercent: field({ type: Number, label: 'Tax percent' }), // Vat percent
    tax: field({ type: Number, label: 'Tax' }), // Tax
    discountPercent: field({ type: Number, label: 'Discount percent' }), // Discount percent
    discount: field({ type: Number, label: 'Discount' }), // Discount
    amount: field({ type: Number, label: 'Amount' }), // Amount
    tickUsed: field({ type: Boolean, label: 'Tick used' }), // TickUsed
    isVatApplied: field({ type: Boolean, label: 'Is vat applied' }), // isVatApplied
    assignUserId: field({ type: String, optional: true, esType: 'keyword' }), // AssignUserId
    branchId: field({ type: String, optional: true, esType: 'keyword' }),
    departmentId: field({ type: String, optional: true, esType: 'keyword' })
  },
  { _id: false }
);

export const dealSchema = new Schema({
  ...commonItemFieldsSchema,

  productsData: field({ type: [productDataSchema], label: 'Products' }),
  paymentsData: field({ type: Object, optional: true, label: 'Payments' })
});
