import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';
import { attachmentSchema } from './boards';
export interface IProductTemplate {
  type: string;
  title: string;
  discount: number;
  totalAmount: number;
  description: string;
  templateItems: any[];
  tagIds?: string[];
  templateImage?: any;
  status: string;
  parentId?: string;
  updatedAt: Date;
  updatedBy: string;
  createdAt: Date;
  createdBy: string;
}

export interface IProductTemplateDocument extends IProductTemplate, Document {
  _id: string;
  order?: string;
  relatedIds?: string[];
}

export const productTemplateItem = new Schema({
  categoryId: field({ type: String, label: 'Category' }),
  itemId: field({ type: String, label: 'Product' }),
  unitPrice: field({ type: Number, label: 'Unit price' }),
  quantity: field({ type: Number, label: 'quantity' }),
  discount: field({ type: Number, label: 'discount' }),
  attachment: field({ type: attachmentSchema })
});

export const productTemplateSchema = schemaWrapper(
  new Schema({
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
    tagIds: field({
      type: [String],
      optional: true,
      label: 'Tags',
      index: true
    }),
    templateImage: field({ type: attachmentSchema }),
    status: field({ type: String, label: 'Status' }),
    tags: field({ type: [String], label: 'Tags' }),
    updatedAt: field({
      type: Date,
      label: 'Updated at'
    }),
    parentId: field({ type: String, label: 'Parent', optional: true }),
    order: field({ type: String, label: 'Order', optional: true }),
    relatedIds: field({
      type: [String],
      optional: true,
      label: 'Childrens'
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
