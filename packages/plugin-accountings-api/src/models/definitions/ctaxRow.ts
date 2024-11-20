import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';

export const CTAX_ROW_STATUS = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted'],
};

export const CtaxRowKinds = {
  NORMAL: 'normal',
  FORMULA: 'formula',
  TITLE: 'title',
  HIDDEN: 'hidden',
  ALL: ['normal', 'formula', 'title', 'hidden'],
}

export interface ICtaxRow {
  name: string;
  number: string;
  kind: string;
  formula: string;
  formula_text: string;
  status: string;
  percent: number;
}

export interface ICtaxRowDocument extends ICtaxRow, Document {
  _id: string;
}

export const ctaxRowSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String }),
    number: field({ type: String }),
    kind: field({ type: String, enum: CtaxRowKinds.ALL }),
    formula: field({ type: String, optional: true }),
    formula_text: field({ type: String, optional: true }),
    status: field({
      type: String,
      enum: CTAX_ROW_STATUS.ALL,
      label: 'Status',
      default: 'active',
      index: true,
    }),
    percent: field({ type: Number, default: 0 }),
  }),
);
