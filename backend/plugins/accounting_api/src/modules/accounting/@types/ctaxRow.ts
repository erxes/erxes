import { Document } from 'mongoose';
import { ITaxRowLedgerFormula, TaxRowValueSide } from './taxRow';

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
};

export interface ICtaxRow {
  name: string;
  number: string;
  kind: string;
  formula: string;
  formulaText: string;
  status: string;
  percent: number;
  tabCount?: number;
  isBold?: boolean;
  valueSide?: TaxRowValueSide | '';
  ledgerFormulas?: ITaxRowLedgerFormula[];
}

export interface ICtaxRowDocument extends ICtaxRow, Document {
  _id: string;
}
