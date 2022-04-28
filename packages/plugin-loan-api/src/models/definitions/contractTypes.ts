import { LEASE_TYPES } from "./constants";

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
  leaseType: string;
  createdAt: Date;
  productCategoryIds: string[];
  config: IContractConfig;
}

export interface IContractTypeDocument extends IContractType {
  _id: string;
}

export const contractTypeSchema = {
  _id: { pkey: true },
  code: { type: String, label: 'Code', unique: true },
  name: { type: String, label: 'Name' },
  description: { type: String, optional: true, label: 'Description' },
  status: { type: String, default: 'active', label: 'Status' },
  number: { type: String, label: 'Number' },
  vacancy: { type: Number, min: 1, max: 10, label: 'Vacancy', required: true },
  leaseType: { type: String, enum: LEASE_TYPES.ALL, label: 'Lease Type', required: true, default: LEASE_TYPES.FINANCE },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },
  productCategoryIds: { type: [String], label: 'Allow Product Categories' },
  config: { type: Object }
};
