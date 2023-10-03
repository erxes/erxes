export type LoanContract = {
  contractTypeId: string;
  status: string;
  description: string;
  marginAmount: number;
  leaseAmount: number;
  feeAmount: number;
  tenor: number;
  interestRate: number;
  interestMonth: number;
  skipInterestCalcMonth: number;
  repayment: string;
  startDate: Date;
  scheduleDays: number[];
  customerId: string;
  customerType: string;
  branchId: string;
  unduePercent: number;
  undueCalcType: string;
  currency: string;
  debt: number;
  debtTenor: number;
  debtLimit: number;
  salvageAmount: number;
  salvagePercent: number;
  salvageTenor: number;
  skipAmountCalcMonth: number;
  relationExpertId: string;
  leasingExpertId: string;
  riskExpertId: string;
  useDebt: boolean;
  useMargin: boolean;
  useSkipInterest: boolean;
  leaseType: string;
  weekends: number[];
  useHoliday: boolean;
  relContractId?: string;
  isPayFirstMonth?: boolean;
  isBarter?: boolean;
  downPayment?: number;
  customPayment?: number;
  customInterest?: number;
};

export type LoanSchedule = {
  order: number;
  payment: number;
  balance: number;
  diffDay: number;

  contractId?: string;
  version?: string;
  createdAt?: Date;
  status?: string;
  payDate: Date;

  undue?: number;
  interestEve?: number;
  interestNonce?: number;
  insurance?: number;
  debt?: number;
  total: number;

  didUndue?: number;
  didInterestEve?: number;
  didInterestNonce?: number;
  didPayment?: number;
  didInsurance?: number;
  didDebt?: number;
  didTotal?: number;
  surplus?: number;

  scheduleDidPayment?: number;
  scheduleDidInterest?: number;
  scheduleDidStatus?: 'done' | 'less' | 'pending';

  transactionIds?: string[];
  isDefault?: boolean;
};
