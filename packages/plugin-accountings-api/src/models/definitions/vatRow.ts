import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';

export const VAT_ROW_STATUS = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted'],
};

export const VatRowKinds = {
  NORMAL: 'normal',
  FORMULA: 'formula',
  TITLE: 'title',
  HIDDEN: 'hidden',
  FREE: 'free',
  ALL: ['normal', 'formula', 'title', 'hidden', 'free'],
}

export interface IVatRow {
  name: string;
  number: string;
  kind: string;
  formula: string;
  formula_text: string;
  tabCount: number;
  isBold: boolean;
  status: string;
  percent: number;
}

export interface IVatRowDocument extends IVatRow, Document {
  _id: string;
}

export const vatRowSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String }),
    number: field({ type: String }),
    kind: field({ type: String, enum: VatRowKinds.ALL }),
    formula: field({ type: String, optional: true }),
    formula_text: field({ type: String, optional: true }),
    tabCount: field({ type: Number, default: 0 }),
    isBold: field({ type: Boolean, default: false }),
    status: field({
      type: String,
      enum: VAT_ROW_STATUS.ALL,
      label: 'Status',
      default: 'active',
      index: true,
    }),
    percent: field({ type: Number, default: 0 }),
  }),
);
