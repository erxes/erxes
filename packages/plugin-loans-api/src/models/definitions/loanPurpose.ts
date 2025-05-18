import { Document, Schema, HydratedDocument } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IPurpose {
  name: string;
  parentId: string;
  code: string;
  order: string;
  description: string;
}

export interface IPurposeDocument extends IPurpose, Document {
  _id: string;
  createdAt?: Date;
}

export const purposeSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name', optional: true }),
    parentId: field({ type: String, label: 'Parent code', optional: true }),
    code: field({ type: String, label: 'Code', optional: true }),
    order: field({ type: String, label: 'Order' }),
    description: field({ type: String, label: 'description', optional: true }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at',
    }),
  }),
  'erxes_purposeSchema'
);
