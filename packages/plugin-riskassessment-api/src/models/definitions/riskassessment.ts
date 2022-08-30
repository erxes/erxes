import { Document, Schema } from 'mongoose';
import { field } from './utils';
export interface IRiskAssessmentDocument extends Document {
  _id: string;
  createdAt: Date;
  name: String;
  description: String;
  categoryId: String;
  status: String;
}

export interface IRiskAssessmentCategoryDocument extends Document {
  _id: String;
  name: String;
  formId: String;
  parentId: String;
  order: String;
  code: String;
}

export const riskAssessmentCategorySchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Category Name' }),
  formId: field({ type: String, label: 'Category Form Id' }),
  parentId: field({ type: String, label: 'Category Parent Name' }),
  order: field({ type: String, label: 'Category Order' }),
  code: field({ type: String, label: 'Category Code' }),
});

export const riskAssessmentSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Description' }),
  createdAt: field({ type: Date, default: new Date(), label: 'Created At' }),
  categoryId: field({ type: String, label: 'Risk Assessment Category Id' }),
  status: field({ type: String, label: 'Status' }),
});
