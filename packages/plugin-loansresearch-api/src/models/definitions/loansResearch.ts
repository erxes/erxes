import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';
import { IAttachment } from '@erxes/api-utils/src/types';

export interface IIncome {
  _id: string;
  incomeType: string;
  totalSalaryIncome: number;
  totalMonth: number;

  businessLine: string;
  businessDetails: string;
  businessProfile: string;
  businessIncome: number;
  files: IAttachment[];
}

export interface ILoan {
  _id: string;
  loanType: string;

  loanName: string;
  loanLocation: string;
  startDate: Date;
  closeDate: Date;
  loanAmount: number;

  costName: string;
  costAmount: number;
  files: IAttachment[];
}

export interface ILoanResearch {
  dealId: string;
  customerType: string;
  customerId: string;
  debtIncomeRatio: number;
  increaseMonthlyPaymentAmount: number;

  averageSalaryIncome: number;
  averageBusinessIncome: number;
  totalIncome: number;
  incomes: IIncome[];

  monthlyCostAmount: number;
  monthlyLoanAmount: number;
  totalPaymentAmount: number;
  loans: ILoan[];

  createdAt: Date;
  modifiedAt: Date;
}

export interface ILoanResearchDocument extends ILoanResearch, Document {
  _id: string;
}

export const INCOME_TYPE = {
  SALARY: 'Salary',
  BUSINESS: 'Business',
  ALL: ['Salary', 'Business'],
};

export const LOAN_TYPE = {
  LOAN: 'Loan',
  COST: 'Cost',
  ALL: ['Loan', 'Cost'],
};

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
      incomeType: {
        type: String,
        enum: INCOME_TYPE.ALL,
        default: 'Salary',
        esType: 'keyword',
        index: true,
      },

      totalSalaryIncome: { type: Number, optional: true },
      totalMonth: { type: Number, optional: true },

      businessLine: { type: String, optional: true },
      businessDetails: { type: String, optional: true },
      businessProfile: { type: String, optional: true },
      businessIncome: { type: Number, optional: true },

      files: { type: [attachmentSchema] },
    },
    { _id: false }
  )
);

export const loanSchema = schemaWrapper(
  new Schema(
    {
      _id: { type: String },
      loanType: {
        type: String,
        enum: LOAN_TYPE.ALL,
        default: 'Loan',
        esType: 'keyword',
        index: true,
      },
      loanName: { type: String, optional: true },
      loanLocation: { type: String, optional: true },
      loanAmount: { type: Number, optional: true },
      startDate: { type: Date, optional: true },
      closeDate: { type: Date, optional: true },

      costName: { type: String, optional: true },
      costAmount: { type: Number, optional: true },

      files: { type: [attachmentSchema] },
    },
    { _id: false }
  )
);

export const loanResearchSchema = schemaWrapper(
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

    averageSalaryIncome: field({
      type: Number,
      optional: true,
      label: 'average salary income',
    }),
    averageBusinessIncome: field({
      type: Number,
      optional: true,
      label: 'average business income',
    }),
    totalIncome: field({ type: Number, optional: true, label: 'total income' }),
    incomes: field({ type: [incomeSchema], optional: true }),

    monthlyCostAmount: field({
      type: Number,
      optional: true,
      label: 'monthly cost amount',
    }),
    monthlyLoanAmount: field({
      type: Number,
      optional: true,
      label: 'monthly loan amount',
    }),
    totalPaymentAmount: field({
      type: Number,
      optional: true,
      label: 'total payment amount',
    }),
    loans: field({
      type: [loanSchema],
      optional: true,
    }),
  })
);
