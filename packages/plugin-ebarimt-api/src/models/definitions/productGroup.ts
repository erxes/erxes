import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IProductGroup {
  mainProductId: string;
  subProductId: string;
  sortNum: number;
  ratio?: number;
  isActive: boolean;
  modifiedBy?: string;
}

export interface IProductGroupDocument extends Document, IProductGroup {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  modifiedBy: string;
}

export const productGroupSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created at' }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),
    modifiedBy: field({ type: String, label: 'Modified User' }),

    mainProductId: field({ type: String, label: 'Main Product', unique: true }),
    subProductId: field({ type: String, label: 'Sub Product' }),
    sortNum: field({ type: Number, label: 'Sort Number', default: 1 }),
    ratio: field({ type: Number, label: 'ratio', optional: true }),
    isActive: field({ type: Boolean, label: 'isActive' }),
  }),

  'erxes_ebarimt'
);
