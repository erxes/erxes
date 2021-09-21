import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IProductTemplateItem {
  categoryId: string;
  item: string;
  unitPrice: string;
  quantity: string;
  discount: string;
}

export interface IProductTemplate {
  type: string;
  title: string;
  discount: string;
  totalAmount: string;
  description: string;
  templateItems: IProductTemplateItem[];
  updatedAt: Date;
  updatedBy: string;
  createdAt: Date;
  createdBy: string;
}

export interface IProductTemplateDocument extends IProductTemplate, Document {
  _id: string;
}

export const productTemplateItem = new Schema({
  categoryId: field({ type: String, label: 'Category' }),
  item: field({ type: String, label: 'Product' }),
  unitPrice: field({ type: String, label: 'Unit price' }),
  quantity: field({ type: String, label: 'quantity' }),
  discount: field({ type: String, label: 'discount' })
});

export const productTemplateSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String, label: 'Type' }),
  title: field({ type: String, label: 'Title' }),
  discount: field({ type: String, label: 'Discount' }),
  totalAmount: field({ type: String, label: 'Total amount' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  templateItems: field({
    type: [productTemplateItem],
    default: [],
    label: 'Type'
  }),
  status: field({ type: String, label: 'Status' }),
  tags: field({ type: [String], label: 'Total amount' }),
  updatedAt: field({
    type: Date,
    label: 'Updated at'
  }),
  updatedUser: field({ type: String, label: 'Status' }),
  createdAt: field({
    type: Date,
    default: new Date(),
    label: 'Created at'
  }),
  createdUser: field({ type: String, label: 'Status' }),
  textValue: field({ type: String, label: 'Total amount' })
});
