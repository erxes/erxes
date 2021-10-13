import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';
export interface IProductTemplate {
  type: string;
  title: string;
  discount: number;
  totalAmount: number;
  description: string;
  templateItems: any[];
  status: string;
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
  itemId: field({ type: String, label: 'Product' }),
  unitPrice: field({ type: Number, label: 'Unit price' }),
  quantity: field({ type: Number, label: 'quantity' }),
  discount: field({ type: Number, label: 'discount' })
});

export const productTemplateSchema = schemaWrapper(new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String, label: 'Type' }),
  title: field({ type: String, label: 'Title' }),
  discount: field({ type: Number, label: 'Discount' }),
  totalAmount: field({ type: Number, label: 'Total amount' }),
  description: field({ type: String, optional: true, label: 'Description' }),  
  templateItems: field({
    type: [],
    default: [],
    label: 'Type'
  }),
  status: field({ type: String, label: 'Status' }),
  tags: field({ type: [String], label: 'Tags' }),
  updatedAt: field({
    type: Date,
    label: 'Updated at'
  }),
  updatedUser: field({ type: String, label: 'Updated user' }),
  createdAt: field({
    type: Date,
    default: new Date(),
    label: 'Created at'
  }),
  createdBy: field({ type: String, label: 'Created User' }),
  textValue: field({ type: String, label: 'Text value' })
})
);
