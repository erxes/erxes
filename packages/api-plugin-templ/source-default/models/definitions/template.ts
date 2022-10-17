import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ITemplate {
  name: string;
  createdAt?: Date;
  expiryDate?: Date;
  checked: Boolean;
  typeId: string;
}

export interface IType {
  name: string;
}

export interface ITypeDocument extends IType, Document {
  _id: string;
}

export interface ITemplateDocument extends ITemplate, Document {
  _id: string;
}

export const typeSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Type name' })
});

export const templateSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  createdAt: field({ type: Date, label: 'Created at' }),
  expiryDate: field({ type: Date, label: 'Expiry Date' }),
  checked: field({ type: Boolean, label: 'Checked', default: false }),
  typeId: field({ type: String, label: 'Type Id' })
});
