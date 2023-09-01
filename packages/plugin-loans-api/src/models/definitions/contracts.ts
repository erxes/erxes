import {
  CONTRACT_CLASSIFICATION,
  CONTRACT_STATUS,
  REPAYMENT_TYPE
} from './constants';
import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

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
  /**
   * @property {status} string
   * draft normal bad closed
   */
  status: string;
  classification: string;
  branchId: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  marginAmount?: number;
  leaseAmount: number;
  feeAmount?: number;
  /**
   * @property {number} tenor loan duration month
   */
  tenor: number;
  interestRate: number;
  unduePercent: number;
  repayment: string;
  startDate: Date;
  scheduleDays: number[];
  insuranceAmount: number;
  /**
   * @property {number} debt loan debit amount it will be chance to lender can pay lower than main payment amount
   * if current payment 15000 amount then lender payed 1000 debt then lender can pay 14000 amount
   */
  debt?: number;
  /**
   * @property {number} debtTenor this field is related with debt field
   * it's meaning duration of debt split payment
   * for example debt amount is 5000 then debtTenor is 2 then first month 2500 tenor payment required next month 2500 tenor payment required
   */
  debtTenor?: number;
  debtLimit?: number;

  collateralsData: ICollateralDataDoc[];
  insurancesData: IInsurancesData[];

  salvageAmount?: number;
  salvagePercent?: number;
  salvageTenor?: number;

  customerId?: string;
  customerType?: string;

  relCustomer?: [{ customerId: string; customerType: string }];

  relationExpertId?: string;
  leasingExpertId?: string;
  riskExpertId?: string;

  weekends: number[];
  useHoliday: boolean;
  useMargin: boolean;
  useSkipInterest: boolean;
  useDebt: boolean;

  closeDate?: Date;
  closeType?: string;
  closeDescription?: string;

  relContractId?: string;

  isExpired?: boolean;
  repaymentDate?: Date;
  undueCalcType?: string;

  skipInterestCalcMonth?: number;

  dealId?: string;
  currency: string;
  storedInterest: number;
  lastStoredDate: Date;
  isPayFirstMonth: boolean;
  downPayment: number;
  isBarter: boolean;
  isStoppedInterest: boolean;
  stoppedInterestDate: Date;
}

export interface IContractDocument extends IContract, Document {
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
  amount: { type: Number }
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
  insuranceAmount: { type: Number }
};

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
    classification: field({
      type: String,
      label: 'Classification',
      enum: CONTRACT_CLASSIFICATION.ALL,
      required: true,
      default: CONTRACT_CLASSIFICATION.NORMAL
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
    marginAmount: field({
      type: Number,
      optional: true,
      label: 'Loan margin'
    }),
    leaseAmount: field({
      type: Number,
      optional: true,
      label: 'Loan amount'
    }),
    feeAmount: field({
      type: Number,
      optional: true,
      label: 'Loan fee'
    }),
    tenor: field({
      type: Number,
      min: 0,
      max: 600,
      label: 'Loan tenor (in months)'
    }),
    interestRate: field({
      type: Number,
      min: 0,
      max: 100,
      label: 'Loan Interest Rate'
    }),
    unduePercent: field({
      type: Number,
      min: 0,
      max: 100,
      label: 'Loan Undue percent'
    }),
    repayment: field({
      type: String,
      enum: REPAYMENT_TYPE.map(option => option.value),
      required: true,
      label: 'Schedule Type',
      selectOptions: REPAYMENT_TYPE
    }),
    startDate: field({ type: Date, label: 'Rate Start Date' }),
    scheduleDays: field({
      type: [Number],
      min: 1,
      max: 31,
      label: 'Schedule Day'
    }),

    insurancesData: field({
      type: [insuranceDataSchema],
      label: 'Insurances'
    }),
    collateralsData: field({
      type: [collateralDataSchema],
      label: 'Collaterals'
    }),

    insuranceAmount: field({
      type: Number,
      optional: true,
      label: 'Insurance'
    }),
    debt: field({ type: Number, optional: true, label: 'Debt' }),
    debtTenor: field({
      type: Number,
      optional: true,
      label: 'debt tenor'
    }),
    debtLimit: field({
      type: Number,
      optional: true,
      label: 'Debt Limit'
    }),

    salvageAmount: field({
      type: Number,
      optional: true,
      label: 'Salvage Amount'
    }),
    salvagePercent: field({
      type: Number,
      optional: true,
      label: 'Salvage Percent'
    }),
    salvageTenor: field({
      type: Number,
      optional: true,
      label: 'Salvage Tenor'
    }),
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
    relCustomer: field({
      type: [{ customerId: String, customerType: String }],
      optional: true,
      label: "Loan related customer's"
    }),
    relationExpertId: field({
      type: String,
      optional: true,
      label: 'relation Expert'
    }),
    leasingExpertId: field({
      type: String,
      optional: true,
      label: 'leasing Expert'
    }),
    riskExpertId: field({
      type: String,
      optional: true,
      label: 'risk Expert'
    }),
    weekends: field({ type: [Number], label: 'weekend' }),
    useHoliday: field({ type: Boolean, label: 'use holiday' }),
    useMargin: field({ type: Boolean, label: 'use margin' }),
    useSkipInterest: field({ type: Boolean, label: 'use skip interest' }),
    useDebt: field({ type: Boolean, label: 'use debt' }),
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

    relContractId: field({
      type: String,
      optional: true,
      label: 'Change condition contract'
    }),
    isExpired: field({
      type: Boolean,
      optional: true,
      label: 'Is Expired'
    }),
    repaymentDate: field({
      type: Date,
      optional: true,
      label: 'Repayment'
    }),
    undueCalcType: field({
      type: String,
      optional: true,
      label: 'Undue Calc Type'
    }),
    skipInterestCalcMonth: field({
      type: Number,
      optional: true,
      label: 'Skip Interest Calc Month'
    }),
    dealId: field({
      type: String,
      optional: true,
      label: 'contract relation of dealId'
    }),
    currency: field({
      type: String,
      default: 'MNT',
      label: 'contract currency of lease'
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
    isPayFirstMonth: field({
      type: Boolean,
      default: false,
      label: 'Is pay first month'
    }),
    downPayment: field({
      type: Number,
      default: 0,
      label: 'Down payment'
    }),
    isBarter: field({
      type: Boolean,
      default: false,
      label: 'Is Barter'
    }),
    isStoppedInterest: field({
      type: Boolean,
      default: false,
      label: 'Is stopped interest'
    }),
    stoppedInterestDate: field({
      type: Date,
      label: 'Stopped interest date'
    })
  }),
  'erxes_contractSchema'
);
