import { Document, Schema } from 'mongoose';
import {
  attachmentSchema,
  commonItemFieldsSchema,
  IItemCommonFields
} from './boards';

import { customFieldSchema, ICustomField } from './common';

import { EXPENSE_DIVIDE_TYPES } from './constants';
import { field, schemaWrapper } from './utils';

export interface IProductPurchaseData extends Document {
  productId: string;
  uom: string;
  currency: string;
  quantity: number;
  unitPrice: number;
  globalUnitPrice: number;
  unitPricePercent: number;
  taxPercent?: number;
  tax?: number;
  vatPercent?: number;
  discountPercent?: number;
  discount?: number;
  amount?: number;
  tickUsed?: boolean;
  isVatApplied?: boolean;
  assignUserId?: string;
  branchId?: string;
  departmentId?: string;
  costPrice: number;
}

export interface IExpensesPurchaseData extends Document {
  price: number;
  _id: string;
  expenseId: string;
  value: number;
  type: string;
}

interface IPaymentsPurchaseData {
  [key: string]: {
    currency?: string;
    amount?: number;
  };
}

export interface IPurchase extends IItemCommonFields {
  productsData?: IProductPurchaseData[];
  paymentsData?: IPaymentsPurchaseData[];
  expensesData?: IExpensesPurchaseData[];
}

export interface IPurchaseDocument extends IPurchase, Document {
  _id: string;
}

// Mongoose schemas =======================

export const purchaseproductDataSchema = new Schema(
  {
    _id: field({ pkey: true }),
    productId: field({ type: String, esType: 'keyword' }), // Product
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
    departmentId: field({ type: String, optional: true, esType: 'keyword' }),
    costPrice: field({ type: Number, label: 'Amount price' }) // Cost price
  },
  { _id: false }
);

export const expensDataSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, esType: 'keyword', label: 'name' }),
  expenseId: field({ type: String, esType: 'keyword', label: 'Expense' }),
  price: field({ type: Number, label: 'price' }),
  type: field({ type: String, enum: EXPENSE_DIVIDE_TYPES.ALL, label: 'Type' })
});

export const purchaseSchema = new Schema({
  ...commonItemFieldsSchema,
  productsData: field({ type: [purchaseproductDataSchema], label: 'Products' }),
  paymentsData: field({ type: Object, optional: true, label: 'Payments' }),
  expensesData: field({
    type: [expensDataSchema],
    optianal: true,
    label: 'Expenses'
  })
});
