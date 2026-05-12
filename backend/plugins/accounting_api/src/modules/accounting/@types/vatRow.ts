import { Document } from 'mongoose';

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
