import { CONTRACT_STATUS, REPAYMENT_TYPE } from "./constants";
import { Document } from 'mongoose';

export interface IInsurancesData extends Document {
  insuranceTypeId: string;
  amount?: number;
}

export interface ICollateralData {
  collateralId: string;
  certificate?: String;
  vinNumber?: String;
  cost: number;
  percent: number;
  marginAmount: number;
  leaseAmount: number;

  insuranceTypeId?: string;
  insuranceAmount?: number;
}

export interface ICollateralDataDoc extends ICollateralData, Document {
  _id: string;
}

export interface IContract {
  contractTypeId: string;
  number: string;
  status: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  marginAmount?: number;
  leaseAmount?: number;
  feeAmount?: number;
  tenor: number;
  interestRate: number;
  unduePercent: number;
  repayment: string;
  startDate: Date;
  scheduleDay: number;
  insuranceAmount: number;
  debt?: number;
  debtTenor?: number;
  debtLimit?: number;

  collateralsData: ICollateralDataDoc[];
  insurancesData: IInsurancesData[];

  salvageAmount?: number;
  salvagePercent?: number;
  salvageTenor?: number;

  relationExpertId?: string;
  leasingExpertId?: string;
  riskExpertId?: string;

  weekends: number[];
  useHoliday: boolean;

  closeDate?: Date;
  closeType?: string;
  closeDescription?: string;

  relContractId?: string;
}

export interface IContractDocument extends IContract {
  _id: string;
}

export interface ICloseVariable {
  contractId: string;
  closeDate: Date;
  closeType: string;
  description: string;
}

export const insuranceDataSchema = {
  _id: { type: String },
  insuranceTypeId: { type: String },
  currency: { type: String },
  amount: { type: Number },
};

export const collateralDataSchema = {
  _id: { type: String, default: Math.random() },

  collateralId: { type: String },
  certificate: { type: String },
  vinNumber: { type: String },
  cost: { type: Number },
  percent: { type: Number },
  marginAmount: { type: Number },
  leaseAmount: { type: Number },

  insuranceTypeId: { type: String },
  currency: { type: String },
  insuranceAmount: { type: Number },
}

export const contractSchema = {
  _id: { pkey: true },
  contractTypeId: { type: String, label: 'Contract Type', index: true },
  number: { type: String, label: 'Number', optional: true, index: true },
  status: {
    type: String,
    label: 'Status',
    enum: CONTRACT_STATUS.ALL,
    required: true,
    default: CONTRACT_STATUS.DRAFT
  },
  description: { type: String, optional: true, label: 'Description' },
  createdBy: { type: String, label: 'Created By' },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },
  marginAmount: { type: Number, optional: true, label: 'Loan margin' },
  leaseAmount: { type: Number, optional: true, label: 'Loan amount' },
  feeAmount: { type: Number, optional: true, label: 'Loan fee' },
  tenor: { type: Number, min: 0, max: 600, label: 'Loan tenor (in months)' },
  interestRate: { type: Number, min: 0, max: 100, label: 'Loan Interest Rate' },
  unduePercent: { type: Number, min: 0, max: 100, label: 'Loan Undue percent' },
  repayment: {
    type: String,
    enum: REPAYMENT_TYPE.map(option => option.value),
    required: true,
    label: 'Type',
    selectOptions: REPAYMENT_TYPE
  },
  startDate: { type: Date, label: 'Rate Start Date' },
  scheduleDay: { type: Number, min: 1, max: 31, label: 'Schedule Day' },

  insurancesData: { type: [insuranceDataSchema], label: 'Insurances' },
  collateralsData: { type: [collateralDataSchema], label: 'Collaterals' },

  insuranceAmount: { type: Number, optional: true, label: 'Insurance' },
  debt: { type: Number, optional: true, label: 'Debt' },
  debtTenor: {type: Number, optional: true, label: 'debt tenor'},
  debtLimit: { type: Number, optional: true, label: 'Debt Limit' },

  salvageAmount: { type: Number, optional: true, label: 'Salvage Amount' },
  salvagePercent: { type: Number, optional: true, label: 'Salvage Percent' },
  salvageTenor: { type: Number, optional: true, label: 'Salvage Tenor' },

  relationExpertId: { type: String, optional: true, label: 'relation Expert' },
  leasingExpertId: { type: String, optional: true, label: 'leasing Expert' },
  riskExpertId: { type: String, optional: true, label: 'risk Expert' },
  weekends: { type: [Number], label: 'weekend' },
  useHoliday: { type: Boolean, label: 'use holiday' },

  closeDate: {type: Date, optional: true, label: 'Close Date'},
  closeType: {type: String, optional: true, label: 'Close Type'},
  closeDescription: {type: String, optional: true, label: 'Close Description'},

  relContractId: {type: String, optional: true, label: 'Change condition contract'}
};
