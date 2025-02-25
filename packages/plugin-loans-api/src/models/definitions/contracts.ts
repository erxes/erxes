import {
  CONTRACT_CLASSIFICATION,
  CONTRACT_STATUS,
  LEASE_TYPES,
  REPAYMENT_TYPE,
} from './constants';
import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import {
  customFieldSchema,
  ICustomField,
} from '@erxes/api-utils/src/definitions/common';

export interface IInsurancesData extends Document {
  insuranceTypeId: string;
  amount?: number;
}

export interface IStepRules extends Document {
  _id: string;
  scheduleDays?: number[];
  tenor: number; // loan duration month
  interestRate?: number;

  firstPayDate: Date;

  mainPayPerMonth?: number; // undsen tulultuus sardaa udiig tuluhuur
  totalMainAmount?: number; // niitdee ene heseg hugatsaand udiig tuluhuur
  salvageAmount?: number; // ene heseg udaagiin tulultiin daraa udii uldeheer

  skipInterestCalcMonth?: number;
  skipInterestCalcDay?: number;
  skipAmountCalcMonth?: number;
  skipAmountCalcDay?: number;
}

type HolidayType = 'before' | 'exact' | 'after';

export interface ICollateralData {
  collateralId: string;
  certificate?: String;
  vinNumber?: String;
  cost: number;
  percent: number;
  marginAmount: number;
  leaseAmount: number;
  collateralTypeId: string;
  insuranceTypeId?: string;
  insuranceAmount?: number;
}

export interface ICollateralDataDoc extends ICollateralData, Document {
  _id: string;
}

export interface IContract {
  contractTypeId: string;
  contractDate: Date;
  number: string;
  useManualNumbering: boolean;
  foreignNumber?: string;
  relContractId?: string;
  dealId?: string;
  currency: string;
  /**
   * @property {status} string
   * draft normal bad closed
   */
  status: string;
  statusChangedDate?: Date;

  classification: string;
  branchId: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  modifiedBy?: string;
  modifiedAt?: Date;

  marginAmount?: number;
  leaseAmount: number;
  feeAmount?: number;

  lossPercent?: number;
  lossCalcType?: string;
  skipLossDay?: number;
  allowLateDay?: number;

  startDate: Date;
  firstPayDate: Date;
  endDate: Date;
  // schedule rules
  scheduleDays: number[];
  tenor: number; // loan duration month
  repayment: string;
  interestRate: number; //year

  stepRules?: IStepRules[];

  skipInterestCalcMonth: number;
  skipInterestCalcDay: number;
  skipAmountCalcMonth: number;
  skipAmountCalcDay: number;

  insuranceAmount?: number;
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

  collateralsData?: ICollateralDataDoc[];
  insurancesData?: IInsurancesData[];

  customerType?: string;
  customerId?: string;
  relCustomers?: [{ customerId: string; customerType: string }];

  relationExpertId?: string;
  leasingExpertId?: string;
  riskExpertId?: string;

  closeDate?: Date;
  closeType?: string;
  closeDescription?: string;

  loanPurpose?: string;
  loanDestination?: string;
  leaseType: string;

  customFieldsData?: ICustomField[];
  savingContractId?: string;
  depositAccountId?: string;

  holidayType?: HolidayType;
  weekends?: number[];
  overPaymentIsNext?: boolean;
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
  amount: { type: Number },
};

export const stepRulesSchema = {
  _id: { type: String },
  scheduleDays: { type: [Number] },
  tenor: { type: Number },
  interestRate: { type: Number },
  firstPayDate: { type: Date },
  mainPayPerMonth: { type: Number },
  totalMainAmount: { type: Number },
  salvageAmount: { type: Number },
  skipInterestCalcMonth: { type: Number },
  skipInterestCalcDay: { type: Number },
  skipAmountCalcMonth: { type: Number },
  skipAmountCalcDay: { type: Number },
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
  collateralTypeId: { type: String },
  insuranceTypeId: { type: String },
  currency: { type: String },
  insuranceAmount: { type: Number },
};

export const contractSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    contractTypeId: field({
      type: String,
      label: 'Contract Type',
      index: true,
    }),
    number: field({
      type: String,
      label: 'Number',
      optional: true,
      index: true,
    }),
    useManualNumbering: field({ type: Boolean, label: 'use manual numbering' }),
    foreignNumber: field({
      type: String,
      label: 'foreign Number',
      optional: true,
      index: true,
    }),
    relContractId: field({
      type: String,
      optional: true,
      label: 'Change condition contract',
    }),
    dealId: field({
      type: String,
      optional: true,
      label: 'contract relation of dealId',
    }),
    currency: field({
      type: String,
      default: 'MNT',
      label: 'contract currency of lease',
    }),
    status: field({
      type: String,
      label: 'Status',
      enum: CONTRACT_STATUS.ALL,
      required: true,
      default: CONTRACT_STATUS.NORMAL,
    }),
    statusChangedDate: field({
      type: Date,
      optional: true,
      label: 'Status changed at',
    }),
    classification: field({
      type: String,
      label: 'Classification',
      enum: CONTRACT_CLASSIFICATION.ALL,
      required: true,
      default: CONTRACT_CLASSIFICATION.NORMAL,
    }),
    branchId: field({ type: String, optional: true, label: 'Branch Id' }),
    departmentId: field({
      type: String,
      optional: true,
      label: 'Department Id',
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    createdBy: field({ type: String, label: 'Created By' }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at',
    }),
    modifiedBy: field({ type: String, label: 'Modified By' }),
    modifiedAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Modified at',
    }),

    marginAmount: field({ type: Number, optional: true, label: 'Loan margin' }),
    leaseAmount: field({ type: Number, optional: true, label: 'Loan amount' }),
    feeAmount: field({ type: Number, optional: true, label: 'Loan fee' }),

    lossPercent: field({ type: Number, min: 0, label: 'Loan Loss percent' }),
    lossCalcType: field({
      type: String,
      optional: true,
      label: 'Loss Calc Type',
    }),

    contractDate: field({ type: Date, label: 'Contract Date' }),
    startDate: field({ type: Date, label: 'Start Date' }),
    firstPayDate: field({ type: Date, label: 'First Pay Date' }),
    endDate: field({ type: Date, label: 'End Date' }),
    scheduleDays: field({ type: [Number], label: 'Schedule Day' }),
    tenor: field({ type: Number, min: 0, label: 'Loan tenor (in months)' }),
    repayment: field({
      type: String,
      enum: REPAYMENT_TYPE.map((option) => option.value),
      required: true,
      label: 'Schedule Type',
      selectOptions: REPAYMENT_TYPE,
    }),
    interestRate: field({ type: Number, min: 0, label: 'Loan Interest Rate' }),
    stepRules: field({
      type: [stepRulesSchema],
      optional: true,
      label: 'step by schedules rules',
    }),

    skipInterestCalcMonth: field({
      type: Number,
      optional: true,
      min: 0,
      label: 'skip Interest Calc Month',
    }),
    skipInterestCalcDay: field({
      type: Number,
      optional: true,
      min: 0,
      label: 'skip Interest Calc Day',
    }),
    skipAmountCalcMonth: field({
      type: Number,
      optional: true,
      min: 0,
      label: 'skip Amount Calc Month',
    }),
    skipAmountCalcDay: field({
      type: Number,
      optional: true,
      min: 0,
      label: 'skip Amount Calc Day',
    }),

    insuranceAmount: field({
      type: Number,
      optional: true,
      label: 'Insurance',
    }),
    debt: field({ type: Number, optional: true, label: 'Debt' }),
    debtTenor: field({ type: Number, optional: true, label: 'debt tenor' }),
    debtLimit: field({ type: Number, optional: true, label: 'Debt Limit' }),

    collateralsData: field({
      type: [collateralDataSchema],
      label: 'Collaterals',
    }),
    insurancesData: field({ type: [insuranceDataSchema], label: 'Insurances' }),

    customerType: field({
      type: String,
      optional: true,
      label: 'Customer Type',
    }),
    customerId: field({ type: String, optional: true, label: 'Customer ID' }),
    relCustomers: field({
      type: [{ customerId: String, customerType: String }],
      optional: true,
      label: "Loan related customer's",
    }),
    relationExpertId: field({
      type: String,
      optional: true,
      label: 'relation Expert',
    }),
    leasingExpertId: field({
      type: String,
      optional: true,
      label: 'leasing Expert',
    }),
    riskExpertId: field({ type: String, optional: true, label: 'risk Expert' }),

    closeDate: field({ type: Date, optional: true, label: 'Close Date' }),
    closeType: field({ type: String, optional: true, label: 'Close Type' }),
    closeDescription: field({
      type: String,
      optional: true,
      label: 'Close Description',
    }),

    loanPurpose: field({ type: String, label: 'Loan purpose' }),
    loanDestination: field({ type: String, label: 'loan Destination' }),
    leaseType: field({
      type: String,
      enum: LEASE_TYPES.ALL,
      label: 'Lease Type',
      required: true,
      default: LEASE_TYPES.FINANCE,
    }),

    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data',
    }),

    savingContractId: field({
      type: String,
      optional: true,
      label: 'Saving contract Id',
    }),
    depositAccountId: field({
      type: String,
      optional: true,
      label: 'Deposit Account',
    }),

    holidayType: field({ type: String, label: 'Holiday type' }),
    weekends: field({ type: [Number], label: 'weekend' }),
    overPaymentIsNext: field({
      type: Boolean,
      label: 'Over Payment is next schedule',
      default: false,
      optional: true,
    }),
  }),
  'erxes_contractSchema'
);
