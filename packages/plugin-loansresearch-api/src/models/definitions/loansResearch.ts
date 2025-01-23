import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';
import { IAttachment } from '@erxes/api-utils/src/types';

export interface IIncome {
  _id: string;
  incomeType: String;
  files: IAttachment;
}

export interface ILoan {
  _id: string;
  startDate: Date;
  closeDate: Date;
  files: IAttachment;
}

export interface ILoanResearch {
  dealId: string;
  customerType: string;
  customerId: string;
  incomes: IIncome[];
  loans: ILoan[];
  totalMonth: number;
  totalIncome: number;
  monthlyIncome: number;
  totalLoanAmount: number;
  monthlyPaymentAmount: number;
  debtIncomeRatio: number;
  increaseMonthlyPaymentAmount: number;
  createdAt: Date;
  modifiedAt: Date;
}

export interface ILoanResearchDocument extends ILoanResearch, Document {
  _id: string;
}

const attachmentSchema = new Schema(
  {
    name: { type: String },
    url: { type: String },
    type: { type: String },
    size: { type: Number, optional: true },
    duration: { type: Number, optional: true },
  },
  { _id: false }
);

export const incomeSchema = schemaWrapper(
  new Schema(
    {
      _id: { type: String },
      incomeType: { type: String },
      files: { type: [attachmentSchema] },
    },
    { _id: false }
  )
);

export const loanSchema = schemaWrapper(
  new Schema(
    {
      _id: { type: String },
      startDate: { type: Date, optional: true },
      closeDate: { type: Date, optional: true },
      files: { type: [attachmentSchema] },
    },
    { _id: false }
  )
);

export const configSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at',
      index: true,
    }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified at',
    }),
    dealId: field({ type: String, optional: true, label: 'deal id' }),
    customerType: field({
      type: String,
      optional: true,
      label: 'customer type',
    }),
    customerId: field({ type: String, optional: true, label: 'customer id' }),
    incomes: field({ type: [incomeSchema], optional: true }),
    loans: field({
      type: [loanSchema],
      optional: true,
    }),
    totalMonth: field({ type: Number, optional: true, label: 'total month' }),
    totalIncome: field({ type: Number, optional: true, label: 'total income' }),
    monthlyIncome: field({
      type: Number,
      optional: true,
      label: 'monthly income',
    }),
    totalLoanAmount: field({
      type: Number,
      optional: true,
      label: 'total loan amount',
    }),
    monthlyPaymentAmount: field({
      type: Number,
      optional: true,
      label: 'monthly payment amount',
    }),
    debtIncomeRatio: field({
      type: Number,
      optional: true,
      label: 'debt to income ratio',
    }),
    increaseMonthlyPaymentAmount: field({
      type: Number,
      optional: true,
      label: 'increase monthly payment amount',
    }),
  })
);
