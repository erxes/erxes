import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';

export const VAT_ROW_STATUS = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted'],
};

export const VATRowKinds = {
  NORMAL: 'normal',
  FORMULA: 'formula',
  TITLE: 'title',
  HIDDEN: 'hidden',
  FREE: 'free',
  ALL: ['normal', 'formula', 'title', 'hidden', 'free'],
}

export interface IVATRow {
  name: string;
  number: string;
  kind: string;
  formula: string;
  formula_text: string;
  tab_count: number;
  is_bold: boolean;
  status: string;
}

export interface IVATRowDocument extends IVATRow, Document {
  _id: string;
}

export const vatRowSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String }),
    number: field({ type: String }),
    kind: field({ type: String, enum: VATRowKinds.ALL }),
    formula: field({ type: String, optional: true }),
    formula_text: field({ type: String, optional: true }),
    tab_count: field({ type: Number, default: 0 }),
    is_bold: field({ type: Boolean, default: false }),
    status: field({
      type: String,
      enum: VAT_ROW_STATUS.ALL,
      label: 'Status',
      default: 'active',
      index: true,
    }),
  }),
);
