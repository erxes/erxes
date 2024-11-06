import { LEASE_TYPES } from './constants';
import { schemaHooksWrapper, field } from './utils';
import { Schema, Document } from 'mongoose';

export interface ICustomField {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
}

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

  lossStock: string;
  lossUserEmail: string;
  lossHasVat: string;
  lossHasCitytax: string;
  lossIsEbarimt: string;

  otherReceivable: string;
  feeIncome: string;
  defaultCustomer: string;
  userEmail: string;
  repaymentTemp: string;

  isAutoSendEBarimt: boolean;

  normalExpirationDay: number;
  expiredExpirationDay: number;
  doubtExpirationDay: number;
  negativeExpirationDay: number;
  badExpirationDay: number;

  boardId: string;
  pipelineId: string;
  stageId: string;
}

export interface IContractType {
  code: string;
  name: string;
  description: string;
  status: string;
  number: string;
  vacancy: number;
  lossPercent: number;
  lossCalcType: string;
  useMargin: boolean;
  useSkipInterest: boolean;
  useDebt: boolean;
  useManualNumbering: boolean;
  useFee: boolean;
  leaseType: string;
  commitmentInterest: number;
  createdAt: Date;
  config: IContractConfig;
  currency: string;
  savingPlusLoanInterest: number;
  savingUpperPercent: number;
  usePrePayment: boolean;
  invoiceDay: string;
  customFieldsData?: ICustomField[];
  productId: string
  productType: string;
}

export interface IContractTypeDocument extends IContractType, Document {
  _id: string;
}

export const customFieldSchema = new Schema(
  {
    field: field({ type: 'String' }),
    value: field({ type: Schema.Types.Mixed }),
    stringValue: field({ type: 'String', optional: true }),
    numberValue: field({ type: 'Number', optional: true }),
    dateValue: field({ type: 'Date', optional: true })
  },
  { _id: false }
);

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
    lossPercent: field({
      type: Number,
      min: 0,
      max: 100,
      label: 'Loss Percent',
      optional: true
    }),
    lossCalcType: field({
      type: String,
      label: 'Loss Calc Type',
      optional: true
    }),
    useDebt: field({
      type: Boolean,
      label: 'Use debt',
      optional: true
    }),
    useMargin: field({
      type: Boolean,
      label: 'Use margin',
      optional: true
    }),
    useSkipInterest: field({ type: Boolean, label: 'use skip interest' }),
    useManualNumbering: field({ type: Boolean, label: 'use manual numbering' }),
    useFee: field({ type: Boolean, label: 'use fee' }),
    leaseType: field({
      type: String,
      enum: LEASE_TYPES.ALL,
      label: 'Lease Type',
      required: true,
      default: LEASE_TYPES.FINANCE
    }),
    commitmentInterest: field({
      type: Number,
      label: 'Commitment Interest',
      default: 0
    }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at'
    }),
    config: field({ type: Object }),
    currency: field({
      type: String,
      default: 'MNT',
      label: 'contract type currency of lease'
    }),
    savingPlusLoanInterest: field({
      type: Number,
      default: 0,
      label: 'Saving loan plus interest'
    }),
    savingUpperPercent: field({
      type: Number,
      default: 0,
      label: 'Saving loan upper percent'
    }),
    usePrePayment: field({
      type: Boolean,
      default: false,
      label: 'use pre payment'
    }),
    invoiceDay: field({
      type: String,
      label: 'invoiceDay'
    }),
    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data',
    }),
    productId: field({
      type: String,
      label: 'product'
    }),
    productType: field({
      type: String,
      default: 'private',
      label: 'product Type'
    }),
  }),
  'erxes_contractTypeSchema'
);
