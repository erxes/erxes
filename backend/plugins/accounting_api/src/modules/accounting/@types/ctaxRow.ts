import { Document } from 'mongoose';

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
