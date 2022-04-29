import { SCHEDULE_STATUS } from './constants';
import { Document } from 'mongoose';

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

export const scheduleSchema = {
  _id: { pkey: true },
  contractId: { type: String, label: 'Contract', index: true },
  version: { type: String, optional: true, label: 'version' },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },
  status: {
    type: String,
    label: 'Status',
    enum: SCHEDULE_STATUS.ALL,
    default: SCHEDULE_STATUS.PENDING,
    required: true,
  },
  payDate: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },

  balance: { type: Number, min: 0, label: 'Loan Balance' },
  undue: { type: Number, min: 0, label: 'Undue', optional: true },
  interestEve: {
    type: Number,
    label: 'Loan Interest Eve month',
    optional: true,
  },
  interestNonce: { type: Number, label: 'Loan Interest Nonce', optional: true },
  payment: { type: Number, label: 'Loan Payment', optional: true },
  insurance: { type: Number, min: 0, label: 'Insurance', optional: true },
  debt: { type: Number, min: 0, label: 'Debt', optional: true },
  total: { type: Number, label: 'Total Payment' },

  didUndue: { type: Number, min: 0, label: 'Did Undue', optional: true },
  didInterestEve: {
    type: Number,
    label: 'Did Loan Interest eve',
    optional: true,
  },
  didInterestNonce: {
    type: Number,
    label: 'Did Loan Interest nonce',
    optional: true,
  },
  didPayment: { type: Number, label: 'Did Loan Payment', optional: true },
  didInsurance: {
    type: Number,
    min: 0,
    label: 'Did Insurance',
    optional: true,
  },
  didDebt: { type: Number, min: 0, label: 'Did Debt', optional: true },
  didTotal: { type: Number, label: 'Did Total Payment', optional: true },
  surplus: { type: Number, min: 0, label: 'Surplus', optional: true },

  transactionIds: { type: [String], label: 'transactions', optional: true },
  isDefault: { type: Boolean, label: 'is default', default: true },
};
