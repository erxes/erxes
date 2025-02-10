import { COLLECTIVELY_RULES, LEASE_TYPES } from './constants';
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

  minInterest: number;
  maxInterest: number;
  minTenor: number;
  maxTenor: number;
  minAmount: number;
  maxAmount: number;
  minCommitmentInterest: number;
  maxCommitmentInterest: number;

  requirements?: string[];
  customerDocuments?: string[];
  companyDocuments?: string[];
}

export interface IContractType {
  code: string;
  name: string;
  description: string;
  status: string;
  number: string;
  vacancy: number;
  leaseType: string;
  currency: string;

  defaultInterest?: number;
  useSkipInterest?: boolean;
  skipInterestDay?: number;
  skipInterestMonth?: number;
  skipPaymentDay?: number;
  skipPaymentMonth?: number;

  lossPercent?: number;
  lossCalcType?: string;
  skipLossDay?: number;
  allowLateDay?: number;

  allowPartOfLease: boolean;
  limitIsCurrent: boolean;
  commitmentInterest: number;

  useMargin: boolean;
  useDebt: boolean;
  useManualNumbering: boolean;

  savingPlusLoanInterest: number;
  savingUpperPercent: number;

  config: IContractConfig;
  productId: string
  productType: string;

  feePercent?: number;
  defaultFee?: number;
  useCollateral?: boolean;
  minPercentMargin?: number;

  overPaymentIsNext?: boolean;
  collectivelyRule?: string;
}

export interface IContractTypeDocument extends IContractType, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
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
    vacancy: field({ type: Number, min: 1, max: 10, label: 'Vacancy', required: true }),
    leaseType: field({ type: String, enum: LEASE_TYPES.ALL, label: 'Lease Type', required: true, default: LEASE_TYPES.FINANCE }),
    currency: field({ type: String, default: 'MNT', label: 'contract type currency of lease' }),

    defaultInterest: field({ type: Number, label: 'Default Percent', optional: true }),
    useSkipInterest: field({ type: Boolean, label: 'use skip interest' }),
    skipInterestDay: field({ type: Number, label: 'Skip interest Day', optional: true }),
    skipInterestMonth: field({ type: Number, label: 'Skip interest Month', optional: true }),
    skipPaymentDay: field({ type: Number, label: 'Skip interest Day', optional: true }),
    skipPaymentMonth: field({ type: Number, label: 'Skip interest Month', optional: true }),

    lossPercent: field({ type: Number, label: 'Loss Percent', optional: true }),
    lossCalcType: field({ type: String, label: 'Loss Calc Type', optional: true }),
    skipLossDay: field({ type: Number, label: 'Skip loss day', optional: true }),
    allowLateDay: field({ type: Number, label: 'Allow late day', optional: true }),

    allowPartOfLease: field({ type: Boolean, label: 'Allow part of lease', optional: true }),
    limitIsCurrent: field({ type: Boolean, label: 'Limit Is Current balance', optional: true }),
    commitmentInterest: field({ type: Number, label: 'Commitment Interest', default: 0 }),

    useMargin: field({ type: Boolean, label: 'Use margin', optional: true }),
    useDebt: field({ type: Boolean, label: 'Use debt', optional: true }),
    useManualNumbering: field({ type: Boolean, label: 'use manual numbering' }),

    savingPlusLoanInterest: field({ type: Number, default: 0, label: 'Saving loan plus interest' }),
    savingUpperPercent: field({ type: Number, default: 0, label: 'Saving loan upper percent' }),
    usePrePayment: field({ type: Boolean, default: false, label: 'use pre payment' }),

    config: field({ type: Object }),
    productId: field({ type: String, optional: true, label: 'product' }),
    productType: field({ type: String, default: 'private', optional: true, label: 'product Type' }),

    feePercent: field({ type: Number, label: 'fee Percent', optional: true }),
    defaultFee: field({ type: Number, label: 'default Fee', optional: true }),
    useCollateral: field({ type: Boolean, label: 'Use Collateral', optional: true }),
    minPercentMargin: field({ type: Number, label: 'Pre Percent', optional: true }),

    collectivelyRule: field({ type: String, optional: true, enum: COLLECTIVELY_RULES.ALL, label: 'collectively Rule' }),
    overPaymentIsNext: field({ type: Boolean, label: 'Over Payment is next schedule', default: false, optional: true }),

    requirements: field({ type: [String], optional: true, label: 'requirements' }),
    customerDocuments: field({ type: [String], optional: true, label: 'customer Documents' }),
    companyDocuments: field({ type: [String], optional: true, label: 'company Documents' }),


    createdAt: field({ type: Date, default: () => new Date(), label: 'Created at' }),
    modifiedAt: field({ type: Date, optional: true, label: 'Created at' }),
  }),
  'erxes_contractTypeSchema'
);
