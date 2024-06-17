import {
  CONTRACT_CLASSIFICATION,
  CONTRACT_STATUS,
  LEASE_TYPES,
<<<<<<< HEAD
  REPAYMENT_TYPE,
=======
  REPAYMENT_TYPE
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
} from "./constants";
import { Document, Schema } from "mongoose";
import { field, schemaHooksWrapper } from "./utils";
import {
  customFieldSchema,
<<<<<<< HEAD
  ICustomField,
=======
  ICustomField
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
} from "@erxes/api-utils/src/definitions/common";

export interface IInsurancesData extends Document {
  insuranceTypeId: string;
  amount?: number;
}

type HolidayType = "before" | "exact" | "after";

export interface ICollateralData {
  collateralId: string;
  certificate?: string;
  vinNumber?: string;
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
  givenAmount?: number;
  loanBalanceAmount: number;
  leaseAmount: number;
  feeAmount?: number;
  /**
   * @property {number} tenor loan duration month
   */
  tenor: number;
  interestRate: number;
  lossPercent: number;
  repayment: string;
  startDate: Date;
  firstPayDate: Date;
  endDate: Date;
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
  useManualNumbering: boolean;
  useFee: boolean;

  closeDate?: Date;
  closeType?: string;
  closeDescription?: string;

  relContractId?: string;

  isExpired?: boolean;
  repaymentDate?: Date;
  lossCalcType?: string;

  skipInterestCalcMonth?: number;

  dealId?: string;
  currency: string;
  storedInterest: number;
  lastStoredDate: Date;
  isPayFirstMonth: boolean;
  downPayment: number;
  isBarter: boolean;
  skipAmountCalcMonth: number;
  customPayment: number;
  customInterest: number;
  isStoppedInterest: boolean;
  stoppedInterestDate: Date;
  loanPurpose: string;
  leaseType: string;
  commitmentInterest: number;
  savingContractId: string;
  customFieldsData?: ICustomField[];
  holidayType: HolidayType;
  mustPayDate: Date;
  depositAccountId: string;
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
      label: "Contract Type",
<<<<<<< HEAD
      index: true,
=======
      index: true
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    number: field({
      type: String,
      label: "Number",
      optional: true,
      index: true,
    }),
    status: field({
      type: String,
      label: "Status",
      enum: CONTRACT_STATUS.ALL,
      required: true,
      default: CONTRACT_STATUS.NORMAL,
    }),
    classification: field({
      type: String,
      label: "Classification",
      enum: CONTRACT_CLASSIFICATION.ALL,
      required: true,
      default: CONTRACT_CLASSIFICATION.NORMAL,
    }),
    branchId: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "Branch Id",
=======
      label: "Branch Id"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    description: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "Description",
=======
      label: "Description"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    createdBy: field({ type: String, label: "Created By" }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
<<<<<<< HEAD
      label: "Created at",
=======
      label: "Created at"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    marginAmount: field({
      type: Number,
      optional: true,
<<<<<<< HEAD
      label: "Loan margin",
=======
      label: "Loan margin"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    leaseAmount: field({
      type: Number,
      optional: true,
<<<<<<< HEAD
      label: "Loan amount",
=======
      label: "Loan amount"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    givenAmount: field({
      type: Number,
      optional: true,
      default: 0,
<<<<<<< HEAD
      label: "Given amount",
=======
      label: "Given amount"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    loanBalanceAmount: field({
      type: Number,
      optional: true,
      default: 0,
<<<<<<< HEAD
      label: "Balance amount",
=======
      label: "Balance amount"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    feeAmount: field({
      type: Number,
      optional: true,
<<<<<<< HEAD
      label: "Loan fee",
=======
      label: "Loan fee"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    tenor: field({
      type: Number,
      min: 0,
      max: 600,
<<<<<<< HEAD
      label: "Loan tenor (in months)",
=======
      label: "Loan tenor (in months)"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    interestRate: field({
      type: Number,
      min: 0,
      max: 100,
<<<<<<< HEAD
      label: "Loan Interest Rate",
=======
      label: "Loan Interest Rate"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    lossPercent: field({
      type: Number,
      min: 0,
      max: 100,
<<<<<<< HEAD
      label: "Loan Loss percent",
=======
      label: "Loan Loss percent"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    repayment: field({
      type: String,
      enum: REPAYMENT_TYPE.map((option) => option.value),
      required: true,
      label: "Schedule Type",
<<<<<<< HEAD
      selectOptions: REPAYMENT_TYPE,
=======
      selectOptions: REPAYMENT_TYPE
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    leaseType: field({
      type: String,
      enum: LEASE_TYPES.ALL,
      label: "Lease Type",
      required: true,
      default: LEASE_TYPES.FINANCE,
    }),
    commitmentInterest: field({
      type: Number,
      label: "Commitment Interest",
<<<<<<< HEAD
      default: 0,
=======
      default: 0
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    startDate: field({ type: Date, label: "Start Date" }),
    firstPayDate: field({ type: Date, label: "First Pay Date" }),
    endDate: field({ type: Date, label: "End Date" }),
    scheduleDays: field({
      type: [Number],
      min: 1,
      max: 31,
<<<<<<< HEAD
      label: "Schedule Day",
    }),
    insurancesData: field({
      type: [insuranceDataSchema],
      label: "Insurances",
    }),
    collateralsData: field({
      type: [collateralDataSchema],
      label: "Collaterals",
=======
      label: "Schedule Day"
    }),
    insurancesData: field({
      type: [insuranceDataSchema],
      label: "Insurances"
    }),
    collateralsData: field({
      type: [collateralDataSchema],
      label: "Collaterals"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),

    insuranceAmount: field({
      type: Number,
      optional: true,
<<<<<<< HEAD
      label: "Insurance",
=======
      label: "Insurance"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    debt: field({ type: Number, optional: true, label: "Debt" }),
    debtTenor: field({
      type: Number,
      optional: true,
<<<<<<< HEAD
      label: "debt tenor",
=======
      label: "debt tenor"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    debtLimit: field({
      type: Number,
      optional: true,
<<<<<<< HEAD
      label: "Debt Limit",
=======
      label: "Debt Limit"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),

    salvageAmount: field({
      type: Number,
      optional: true,
<<<<<<< HEAD
      label: "Salvage Amount",
=======
      label: "Salvage Amount"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    salvagePercent: field({
      type: Number,
      optional: true,
<<<<<<< HEAD
      label: "Salvage Percent",
=======
      label: "Salvage Percent"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    salvageTenor: field({
      type: Number,
      optional: true,
<<<<<<< HEAD
      label: "Salvage Tenor",
=======
      label: "Salvage Tenor"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    customerId: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "Customer ID",
=======
      label: "Customer ID"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    customerType: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "Customer Type",
=======
      label: "Customer Type"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    relCustomer: field({
      type: [{ customerId: String, customerType: String }],
      optional: true,
      label: "Loan related customer's",
    }),
    relationExpertId: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "relation Expert",
=======
      label: "relation Expert"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    leasingExpertId: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "leasing Expert",
=======
      label: "leasing Expert"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    riskExpertId: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "risk Expert",
=======
      label: "risk Expert"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    weekends: field({ type: [Number], label: "weekend" }),
    useHoliday: field({ type: Boolean, label: "use holiday" }),
    useMargin: field({ type: Boolean, label: "use margin" }),
    useSkipInterest: field({ type: Boolean, label: "use skip interest" }),
    useDebt: field({ type: Boolean, label: "use debt" }),
    useManualNumbering: field({ type: Boolean, label: "use manual numbering" }),
    useFee: field({ type: Boolean, label: "use fee" }),
    closeDate: field({
      type: Date,
      optional: true,
<<<<<<< HEAD
      label: "Close Date",
=======
      label: "Close Date"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    closeType: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "Close Type",
=======
      label: "Close Type"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    closeDescription: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "Close Description",
=======
      label: "Close Description"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),

    relContractId: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "Change condition contract",
=======
      label: "Change condition contract"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    isExpired: field({
      type: Boolean,
      optional: true,
<<<<<<< HEAD
      label: "Is Expired",
=======
      label: "Is Expired"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    repaymentDate: field({
      type: Date,
      optional: true,
<<<<<<< HEAD
      label: "Repayment",
=======
      label: "Repayment"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    lossCalcType: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "Loss Calc Type",
=======
      label: "Loss Calc Type"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    skipInterestCalcMonth: field({
      type: Number,
      optional: true,
<<<<<<< HEAD
      label: "Skip Interest Calc Month",
=======
      label: "Skip Interest Calc Month"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    dealId: field({
      type: String,
      optional: true,
<<<<<<< HEAD
      label: "contract relation of dealId",
=======
      label: "contract relation of dealId"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    currency: field({
      type: String,
      default: "MNT",
<<<<<<< HEAD
      label: "contract currency of lease",
=======
      label: "contract currency of lease"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    storedInterest: field({
      type: Number,
      optional: true,
      default: 0,
<<<<<<< HEAD
      label: "Stored Interest",
=======
      label: "Stored Interest"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    lastStoredDate: field({
      type: Date,
      optional: true,
<<<<<<< HEAD
      label: "Last Stored Date",
=======
      label: "Last Stored Date"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    isPayFirstMonth: field({
      type: Boolean,
      default: false,
<<<<<<< HEAD
      label: "Is pay first month",
=======
      label: "Is pay first month"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    downPayment: field({
      type: Number,
      default: 0,
<<<<<<< HEAD
      label: "Down payment",
=======
      label: "Down payment"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    skipAmountCalcMonth: field({
      type: Number,
      default: 0,
<<<<<<< HEAD
      label: "skip Amount Calc Month",
=======
      label: "skip Amount Calc Month"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    customPayment: field({
      type: Number,
      default: 0,
<<<<<<< HEAD
      label: "customPayment",
=======
      label: "customPayment"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    customInterest: field({
      type: Number,
      default: 0,
<<<<<<< HEAD
      label: "customInterest",
=======
      label: "customInterest"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    isBarter: field({
      type: Boolean,
      default: false,
<<<<<<< HEAD
      label: "Is Barter",
=======
      label: "Is Barter"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    isStoppedInterest: field({
      type: Boolean,
      default: false,
<<<<<<< HEAD
      label: "Is stopped interest",
    }),
    stoppedInterestDate: field({
      type: Date,
      label: "Stopped interest date",
    }),
    loanPurpose: field({
      type: String,
      label: "Loan purpose",
    }),
    savingContractId: field({
      type: String,
      label: "Saving contract Id",
=======
      label: "Is stopped interest"
    }),
    stoppedInterestDate: field({
      type: Date,
      label: "Stopped interest date"
    }),
    loanPurpose: field({
      type: String,
      label: "Loan purpose"
    }),
    savingContractId: field({
      type: String,
      label: "Saving contract Id"
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    }),
    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
<<<<<<< HEAD
      label: "Custom fields data",
    }),
    holidayType: field({
      type: String,
      label: "Holiday type",
    }),
    bankAccountNumber: field({
      type: String,
      label: "Bank account number",
    }),
    bankAccountType: field({
      type: String,
      label: "Bank account type",
    }),
    mustPayDate: field({
      type: Date,
      label: "Must pay date",
    }),
=======
      label: "Custom fields data"
    }),
    holidayType: field({
      type: String,
      label: "Holiday type"
    }),
    bankAccountNumber: field({
      type: String,
      label: "Bank account number"
    }),
    bankAccountType: field({
      type: String,
      label: "Bank account type"
    }),
    mustPayDate: field({
      type: Date,
      label: "Must pay date"
    }),
    depositAccountId: field({
      type: String,
      label: "Deposit Account"
    })
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
  }),
  "erxes_contractSchema"
);
