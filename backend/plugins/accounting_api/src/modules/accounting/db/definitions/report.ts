import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

const periodFields = {
  getDate: {
    type: String,
    enum: ['first', 'last', 'between'],
    optional: true,
    label: 'Period boundary',
  },
  isPre: { type: Boolean, optional: true, label: 'Previous period' },
};

const orderedFields = {
  _id: mongooseStringRandomId,
  code: { type: String, trim: true, optional: true, label: 'Code' },
  name: { type: String, default: '', label: 'Name' },
  order: { type: Number, default: 0, min: 0, label: 'Order' },
  isActive: { type: Boolean, default: true, label: 'Active' },
};

export const reportColumnSchema = new Schema({
  ...orderedFields,
  ...periodFields,
  name: { type: String, required: true, trim: true, label: 'Name' },
});

export const reportRowSchema = new Schema({
  ...orderedFields,
  ...periodFields,
  number: { type: String, optional: true, label: 'Display number' },
  kind: {
    type: String,
    enum: ['formula', 'plus_formula', 'title', 'date'],
    default: 'formula',
    label: 'Row kind',
  },
  valueSide: {
    type: String,
    enum: ['call_value', 'debit', 'credit'],
    default: 'call_value',
    label: 'Value side',
  },
  isBold: { type: Boolean, default: false, label: 'Bold' },
  isItalic: { type: Boolean, default: false, label: 'Italic' },
  isUnderline: { type: Boolean, default: false, label: 'Underline' },
  tabCount: { type: Number, min: 0, default: 0, label: 'Indent level' },
});

// Omitted report/section ids refer to the formula's own report/section.
// An omitted column id uses the current column's period context.
export const reportRowReferenceSchema = new Schema(
  {
    reportId: { type: String, optional: true, label: 'Source report' },
    sectionId: { type: String, optional: true, label: 'Source section' },
    rowId: { type: String, required: true, label: 'Source row' },
    columnId: { type: String, optional: true, label: 'Source column' },
  },
  { _id: false },
);

export const reportFormulaSchema = new Schema({
  _id: mongooseStringRandomId,
  rowId: { type: String, required: true, label: 'Target row' },
  // Absent for row formulas; cell formulas identify their target column.
  columnId: { type: String, optional: true, label: 'Target column' },
  kind: {
    type: String,
    required: true,
    enum: ['balance', 'transaction', 'from_row', 'ratio'],
    label: 'Formula kind',
  },
  plusOrMinus: {
    type: Boolean,
    default: true,
    label: 'Add instead of subtract',
  },
  // Erkhet permits both a numeric percentage and conditional percentage text.
  percent: {
    type: String,
    required: true,
    default: '100',
    label: 'Percent rule',
  },
  debitAccountId: { type: String, optional: true, label: 'Debit account' },
  creditAccountId: { type: String, optional: true, label: 'Credit account' },
  debitAccountCategoryId: {
    type: String,
    optional: true,
    label: 'Debit account category',
  },
  creditAccountCategoryId: {
    type: String,
    optional: true,
    label: 'Credit account category',
  },
  ...periodFields,
  valueSide: {
    type: String,
    enum: ['debit', 'credit'],
    optional: true,
    label: 'Value side',
  },
  source: {
    type: reportRowReferenceSchema,
    required: function (this: { kind: string }): boolean {
      return this.kind === 'from_row' || this.kind === 'ratio';
    },
    label: 'Source row reference',
  },
  ratioSource: {
    type: reportRowReferenceSchema,
    required: function (this: { kind: string }): boolean {
      return this.kind === 'ratio';
    },
    label: 'Ratio row reference',
  },
  ratioRule: {
    type: String,
    enum: ['divide', 'multiply'],
    default: 'divide',
    label: 'Ratio operation',
  },
});

export const reportSectionSchema = new Schema({
  ...orderedFields,
  header: { type: String, optional: true, label: 'Section header' },
  footer: { type: String, optional: true, label: 'Section footer' },
  formulaType: {
    type: String,
    enum: ['row', 'cell'],
    default: 'row',
    label: 'Formula scope',
  },
  columns: { type: [reportColumnSchema], default: [], label: 'Columns' },
  rows: { type: [reportRowSchema], default: [], label: 'Rows' },
  formulas: { type: [reportFormulaSchema], default: [], label: 'Formulas' },
});

export const reportSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      label: 'Code',
    },
    name: { type: String, required: true, trim: true, label: 'Name' },
    description: { type: String, optional: true, label: 'Description' },
    header: { type: String, optional: true, label: 'Report header' },
    footer: { type: String, optional: true, label: 'Report footer' },
    version: { type: Number, default: 1, min: 1, label: 'Definition version' },
    orientation: {
      type: String,
      enum: ['portrait', 'landscape'],
      default: 'portrait',
      label: 'Print orientation',
    },
    sections: { type: [reportSectionSchema], default: [], label: 'Sections' },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      label: 'Status',
    },
    createdAt: { type: Date, default: Date.now, label: 'Created at' },
    createdBy: { type: String, optional: true, label: 'Created by' },
    modifiedAt: { type: Date, default: Date.now, label: 'Modified at' },
    modifiedBy: { type: String, optional: true, label: 'Modified by' },
  }),
);
