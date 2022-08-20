import { SCHEDULE_STATUS } from './constants';
import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';

export interface IDefaultScheduleParam {
  leaseAmount: number;
  tenor: number;
  interestRate: number;
  repayment: string;
}

export interface ISchedule {
  contractId: string;
  version: string;
  createdAt: Date;
  status: string;
  payDate: Date;

  balance: number;
  undue?: number;
  interestEve?: number;
  interestNonce?: number;
  payment?: number;
  insurance?: number;
  debt?: number;
  total: number;

  didUndue?: number;
  didInterest?: number;
  didPayment?: number;
  didInsurance?: number;
  didDebt?: number;
  didTotal: number;
  surplus?: number;

  transactionIds?: string[];
  isDefault: boolean;
}

export interface IScheduleDocument extends ISchedule, Document {
  _id: string;
}

export const scheduleSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    contractId: field({ type: String, label: 'Contract', index: true }),
    version: field({ type: String, optional: true, label: 'version' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    status: field({
      type: String,
      label: 'Status',
      enum: SCHEDULE_STATUS.ALL,
      default: SCHEDULE_STATUS.PENDING,
      required: true
    }),
    payDate: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),

    balance: field({ type: Number, min: 0, label: 'Loan Balance' }),
    undue: field({ type: Number, min: 0, label: 'Undue', optional: true }),
    interestEve: field({
      type: Number,
      label: 'Loan Interest Eve month',
      optional: true
    }),
    interestNonce: field({
      type: Number,
      label: 'Loan Interest Nonce',
      optional: true
    }),
    payment: field({ type: Number, label: 'Loan Payment', optional: true }),
    insurance: field({
      type: Number,
      min: 0,
      label: 'Insurance',
      optional: true
    }),
    debt: field({ type: Number, min: 0, label: 'Debt', optional: true }),
    total: field({ type: Number, label: 'Total Payment' }),

    didUndue: field({
      type: Number,
      min: 0,
      label: 'Did Undue',
      optional: true
    }),
    didInterestEve: field({
      type: Number,
      label: 'Did Loan Interest eve',
      optional: true
    }),
    didInterestNonce: field({
      type: Number,
      label: 'Did Loan Interest nonce',
      optional: true
    }),
    didPayment: field({
      type: Number,
      label: 'Did Loan Payment',
      optional: true
    }),
    didInsurance: field({
      type: Number,
      min: 0,
      label: 'Did Insurance',
      optional: true
    }),
    didDebt: field({ type: Number, min: 0, label: 'Did Debt', optional: true }),
    didTotal: field({
      type: Number,
      label: 'Did Total Payment',
      optional: true
    }),
    surplus: field({ type: Number, min: 0, label: 'Surplus', optional: true }),

    transactionIds: field({
      type: [String],
      label: 'transactions',
      optional: true
    }),
    isDefault: field({ type: Boolean, label: 'is default', default: true })
  }),
  'erxes_scheduleSchema'
);
