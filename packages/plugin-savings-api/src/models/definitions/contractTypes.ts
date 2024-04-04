import { schemaHooksWrapper, field } from './utils';
import { Schema, Document } from 'mongoose';

export interface IContractConfig {}

export interface IContractType {
  code: string;
  name: string;
  description: string;
  status: string;
  number: string;
  vacancy: number;
  createdAt: Date;
  config: IContractConfig;
  currency: string;
  interestCalcType: string;
  interestRate: number;
  closeInterestRate: number;
  storeInterestInterval: string;
  branchId: string;
  isAllowIncome: boolean;
  isAllowOutcome: boolean;
  isDeposit: boolean;
}

export interface IContractTypeDocument extends IContractType, Document {
  _id: string;
}

export const contractTypeSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'Code', unique: true }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    status: field({ type: String, default: 'active', label: 'Status' }),
    number: field({ type: String, label: 'Number' }),
    vacancy: field({
      type: Number,
      min: 1,
      max: 10,
      label: 'Vacancy',
      required: true
    }),

    config: field({ type: Object }),
    currency: field({
      type: String,
      default: 'MNT',
      label: 'Currency'
    }),
    interestCalcType: field({ type: String, label: 'Interest calculate type' }),
    storeInterestInterval: field({
      type: String,
      label: 'Interest store interval'
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
    branchId: field({ type: String, label: 'Branch Id' }),
    isAllowIncome: field({ type: Boolean, label: 'Is Allow income' }),
    isAllowOutcome: field({ type: Boolean, label: 'Is Allow outcome' }),
    isDeposit: field({ type: Boolean, label: 'Is Deposit' })
  }),
  'erxes_contractTypeSchema'
);
