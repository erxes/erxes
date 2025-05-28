import { IProduct } from '@erxes/ui-products/src/types';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';

export interface IContract {
  _id: string;
  contractTypeId: string;
  number: string;
  useManualNumbering: boolean;
  foreignNumber?: string;
  relContractId?: string;
  dealId?: string;
  currency: string;
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
  tenor: number;
  repayment: string;
  interestRate: number;
  lossPercent?: number;
  lossCalcType?: string;

  contractDate: Date;
  startDate: Date;
  firstPayDate: Date;
  endDate: Date;
  scheduleDays: number[];
  stepRules?: IStepRules[];

  skipInterestCalcMonth: number;
  skipInterestCalcDay: number;
  skipAmountCalcMonth: number;
  skipAmountCalcDay: number;

  insuranceAmount?: number;
  debt?: number;
  debtTenor?: number;
  debtLimit?: number;

  collateralsData?: ICollateralData[];
  insurancesData?: IInsuranceData[];

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

  customFieldsData?: any[];
  savingContractId?: string;
  depositAccountId?: string;

  holidayType?: string;
  weekends?: number[];

  contractType?: IContractTypeDoc;
  unUsedBalance?: number;
  commitmentInterest: number;
  storedInterest: number;
  isSyncedPolaris: boolean;
  isActiveLoan: boolean;
  isSyncedSchedules: boolean;
  isSyncedCollateral: boolean;
}

export interface IContractDoc extends IContract {
  _id: string;
}

export interface IContractTypeDoc {
  code?: string;
  name?: string;
  description?: string;
  status?: string;
  number?: string;
  vacancy?: number;
  leaseType?: string;
  currency?: string;

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

  allowPartOfLease?: boolean;
  limitIsCurrent?: boolean;
  commitmentInterest?: number;

  useMargin?: boolean;
  useDebt?: boolean;
  useManualNumbering?: boolean;

  savingPlusLoanInterest?: number;
  savingUpperPercent?: number;

  config?: IContractConfig;
  productId?: string;
  productType?: string;

  feePercent?: number;
  defaultFee?: number;
  useCollateral?: boolean;
  minPercentMargin?: number;

  overPaymentIsNext?: boolean;
  collectivelyRule?: string;
}

export interface IContractConfig {
  receivable?: string;
  temp?: string;
  giving?: string;
  tempDebt?: string;

  mainUserEmail?: string;
  mainHasVat?: string;
  mainHasCitytax?: string;
  mainIsEbarimt?: string;

  districtName?: string;
  isAmountUseEBarimt?: boolean;
  isLossUseEBarimt?: boolean;

  interestReceivable?: string;
  interestGiving?: string;
  interestCalcedReceive?: string;
  interestIncome?: string;

  extraInterestUserEmail?: string;
  extraInterestHasVat?: string;
  extraInterestHasCitytax?: string;
  extraInterestIsEbarimt?: string;

  insuranceReceivable?: string;
  insuranceGiving?: string;

  lossStock?: string;
  lossUserEmail?: string;
  lossHasVat?: string;
  lossHasCitytax?: string;
  lossIsEbarimt?: string;

  otherReceivable?: string;
  feeIncome?: string;
  defaultCustomer?: string;
  userEmail?: string;
  repaymentTemp?: string;

  isAutoSendEBarimt?: boolean;

  normalExpirationDay?: number;
  expiredExpirationDay?: number;
  doubtExpirationDay?: number;
  negativeExpirationDay?: number;
  badExpirationDay?: number;

  boardId: string;
  pipelineId: string;
  stageId: string;

  minInterest?: number;
  maxInterest?: number;
  minTenor?: number;
  maxTenor?: number;
  minAmount?: number;
  maxAmount?: number;
  minCommitmentInterest?: number;
  maxCommitmentInterest?: number;

  requirements?: string[];
  customerDocuments?: string[];
  companyDocuments?: string[];

  danRule?: string;
}

export interface IStepRules {
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

export interface IInsuranceTypeDoc {
  createdAt?: Date;
  code: string;
  name?: string;
  description?: string;
  companyId?: string;
  percent: number;
  yearPercents: string;
}

export interface IInsuranceType extends IInsuranceTypeDoc {
  _id: string;
  company?: ICompany;
}

export interface ICollateralData {
  _id: string;
  collateralId?: string;
  collateral?: IProduct;
  certificate?: string;
  vinNumber?: string;
  currency?: string;
  collateralTypeId?: string;

  cost: number;
  percent: number;
  marginAmount: number;
  leaseAmount: number;

  insuranceTypeId?: string;
  insuranceType?: IInsuranceType;
  insuranceAmount: number;
}

export interface IInsuranceData {
  _id: string;
  insuranceTypeId: string;
  insuranceType: IInsuranceType;
  currency: string;
  amount: number;
}

export interface IList {
  _id: string;
  type?: string;
  contantType?: string;
  createdAt?: Date;
  createdBy?: string;
  contentId?: string;
  consumeData: any;
  consumeStr: any;
  sendData: any;
  sendStr: any;
  header: string;
  responseData: any;
  responseStr: any;
  error: string;
  content: string;
  createdUser: any;
}

export type savingHistoryQueryResponse = {
  syncSavingsData: IList;
  loading: boolean;
  refetch: () => void;
};

export type SendLoansMutationResponse = {
  sendContractToPolaris: (params: { variables: { data: any } }) => Promise<any>;
};

export type SyncLoanCollateralsMutationResponse = {
  syncLoanCollateral: (params: { variables: { data: any } }) => Promise<any>;
};

export type SendSchedulesMutationResponse = {
  sendLoanSchedules: (params: { variables: { data: any } }) => Promise<any>;
};

export type ActiveLoanMutationResponse = {
  loanContractActive: (params: {
    variables: { contractNumber: string };
  }) => Promise<any>;
};
