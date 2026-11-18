import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { TAX_ROW_VALUE_SIDES } from '../../@types/taxRow';
import { VAT_ROW_STATUS, VatRowKinds } from '../../@types/vatRow';

const ledgerFormulaSchema = new Schema(
  {
    _id: { type: String, required: true },
    kind: { type: String, enum: ['balance', 'transaction'], required: true },
    plusOrMinus: { type: Boolean, default: true },
    percent: { type: String, default: '100' },
    debitAccountId: { type: String, optional: true },
    creditAccountId: { type: String, optional: true },
    debitAccountCategoryId: { type: String, optional: true },
    creditAccountCategoryId: { type: String, optional: true },
    getDate: {
      type: String,
      enum: ['first', 'last', 'between'],
      required: true,
    },
    valueSide: { type: String, enum: TAX_ROW_VALUE_SIDES, optional: true },
  },
  { _id: false },
);

// Shared by VAT and city tax rows: a value side puts the row's amount into
// the debit or credit column; account formulas add ledger amounts to it.
export const taxRowReportFields = {
  valueSide: {
    type: String,
    enum: ['', ...TAX_ROW_VALUE_SIDES],
    default: '',
    label: 'Settlement column',
  },
  ledgerFormulas: {
    type: [ledgerFormulaSchema],
    default: [],
    label: 'Account formulas',
  },
};

export const vatRowSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    name: { type: String },
    number: { type: String },
    kind: { type: String, enum: VatRowKinds.ALL },
    formula: { type: String, optional: true },
    formulaText: { type: String, optional: true },
    tabCount: { type: Number, default: 0 },
    isBold: { type: Boolean, default: false },
    status: {
      type: String,
      enum: VAT_ROW_STATUS.ALL,
      label: 'Status',
      default: 'active',
      index: true,
    },
    percent: { type: Number, default: 0 },
    ...taxRowReportFields,
  }),
);
