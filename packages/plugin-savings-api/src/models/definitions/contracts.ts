import { CONTRACT_STATUS } from './constants';
import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IContract {
  contractTypeId: string;
  number: string;
  status: string;
  branchId: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  savingAmount: number;
  startDate: Date;
  duration: number;
  endDate: Date;
  interestRate: number;
  closeInterestRate: number;

  customerId?: string;
  customerType?: string;

  closeDate?: Date;
  closeType?: string;
  closeDescription?: string;

  dealId?: string;
  storedInterest: number;
  lastStoredDate: Date;
  currency: string;
  interestCalcType: string;
  storeInterestInterval: string;
  isAllowIncome: boolean;
  isAllowOutcome: boolean;
  isDeposit: boolean;
  interestGiveType: string;
  closeOrExtendConfig: string;
  depositAccount: string;
}

export interface IContractDocument extends IContract, Document {
  _id: string;
}

export const contractSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    contractTypeId: field({
      type: String,
      label: 'Contract Type',
      index: true
    }),
    number: field({
      type: String,
      label: 'Number',
      optional: true,
      index: true
    }),
    status: field({
      type: String,
      label: 'Status',
      enum: CONTRACT_STATUS.ALL,
      required: true,
      default: CONTRACT_STATUS.NORMAL
    }),
    branchId: field({
      type: String,
      optional: true,
      label: 'Branch Id'
    }),
    description: field({
      type: String,
      optional: true,
      label: 'Description'
    }),
    createdBy: field({ type: String, label: 'Created By' }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at'
    }),
    savingAmount: field({
      type: Number,
      default: 0,
      optional: true,
      label: 'Saving amount'
    }),
    duration: field({
      type: Number,
      min: 0,
      max: 600,
      label: 'Saving duration (in months)'
    }),
    interestRate: field({
      type: Number,
      min: 0,
      max: 100,
      label: 'Saving Interest Rate'
    }),
    closeInterestRate: field({
      type: Number,
      min: 0,
      max: 100,
      label: 'Saving Close Interest Rate'
    }),
    startDate: field({ type: Date, label: 'Start Date' }),
    endDate: field({ type: Date, label: 'End Date' }),
    customerId: field({
      type: String,
      optional: true,
      label: 'Customer ID'
    }),
    customerType: field({
      type: String,
      optional: true,
      label: 'Customer Type'
    }),
    closeDate: field({
      type: Date,
      optional: true,
      label: 'Close Date'
    }),
    closeType: field({
      type: String,
      optional: true,
      label: 'Close Type'
    }),
    closeDescription: field({
      type: String,
      optional: true,
      label: 'Close Description'
    }),

    dealId: field({
      type: String,
      optional: true,
      label: 'contract relation of dealId'
    }),
    currency: field({
      type: String,
      default: 'MNT',
      label: 'contract currency of saving'
    }),
    storedInterest: field({
      type: Number,
      optional: true,
      default: 0,
      label: 'Stored Interest'
    }),
    lastStoredDate: field({
      type: Date,
      optional: true,
      label: 'Last Stored Date'
    }),
    interestCalcType: field({ type: String, label: 'Interest calculate type' }),
    storeInterestInterval: field({
      type: String,
      label: 'Interest store interval'
    }),
    isAllowIncome: field({ type: Boolean, label: 'Is Allow income' }),
    isAllowOutcome: field({ type: Boolean, label: 'Is Allow outcome' }),
    isDeposit: field({ type: Boolean, label: 'Is Deposit' }),
    interestGiveType: field({
      type: String,
      label: 'Interest give type'
    }),
    closeOrExtendConfig: field({
      type: String,
      label: 'Close or extend config'
    }),
    depositAccount: field({
      type: String,
      label: 'Deposit account'
    })
  }),
  'erxes_contractSchema'
);

export interface ICloseVariable {
  contractId: string;
  closeDate: Date;
  closeType: string;
  description: string;
}
