import { LEASE_TYPES } from './constants';
import { schemaHooksWrapper, field } from './utils';
import { Schema, Document } from 'mongoose';
export interface IContractConfig {
  receivable: string;
  temp: string;
  giving: string;
  tempDebt: string;

  mainUserEmail: string;
  mainHasVat: string;
  mainHasCitytax: string;
  mainIsEbarimt: string;

  interestReceivable: string;
  interestGiving: string;
  interestCalcedReceive: string;
  interestIncome: string;

  extraInterestUserEmail: string;
  extraInterestHasVat: string;
  extraInterestHasCitytax: string;
  extraInterestIsEbarimt: string;

  insuranceReceivable: string;
  insuranceGiving: string;

  undueStock: string;
  undueUserEmail: string;
  undueHasVat: string;
  undueHasCitytax: string;
  undueIsEbarimt: string;

  otherReceivable: string;
  feeIncome: string;
  defaultCustomer: string;
  userEmail: string;
  repaymentTemp: string;
}

export interface IContractType {
  code: string;
  name: string;
  description: string;
  status: string;
  number: string;
  vacancy: number;
  unduePercent: number;
  leaseType: string;
  createdAt: Date;
  productCategoryIds: string[];
  config: IContractConfig;
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
    unduePercent: field({
      type: Number,
      min: 0,
      max: 100,
      label: 'Undue Percent',
      optional: true
    }),
    leaseType: field({
      type: String,
      enum: LEASE_TYPES.ALL,
      label: 'Lease Type',
      required: true,
      default: LEASE_TYPES.FINANCE
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    productCategoryIds: field({
      type: [String],
      label: 'Allow Product Categories'
    }),
    config: field({ type: Object })
  }),
  'erxes_contractTypeSchema'
);
