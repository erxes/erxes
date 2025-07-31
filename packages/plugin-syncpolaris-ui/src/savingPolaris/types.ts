export interface IContract {
  _id: string;
  contractTypeId: string;
  number: string;
  status: string;
  branchId: string;
  description: string;
  savingAmount: number;
  startDate: Date;
  endDate: Date;
  duration: number;
  interestRate: number;
  closeInterestRate: number;

  customerId: string;
  customerType: string;

  currency: string;
  createdBy: string;
  createdAt: Date;
  contractType?: any;

  closeDate?: Date;
  closeType?: string;
  closeDescription?: string;

  dealId?: string;
  storedInterest: number;
  lastStoredDate: Date;
  interestCalcType: string;
  storeInterestInterval: string;
  isAllowIncome: boolean;
  isAllowOutcome: boolean;
  interestGiveType: string;
  closeOrExtendConfig: string;
  depositAccount: string;
  customers?: any;
  loansOfForeclosed?: any;
  expiredDays?: any;
  interestNounce?: any;
  customFieldsData?: any;
  isDeposit?: boolean;
  blockAmount: number;
  isSyncedPolaris?: boolean;
  isActiveSaving?: boolean;
  savingTransactionHistory?: ITransaction[];
}

export interface IContractDoc extends IContract {
  _id: string;
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

export interface ITransactionDoc {
  number?: string;
  contractId?: string;
  customerId?: string;
  companyId?: string;
  transactionType: string;
  description?: string;
  payDate: Date;
  payment?: number;
  currency?: string;
  storedInterest?: number;
  total: number;
  balance?: number;
  isSyncedTransaction?: boolean;
}

export interface ITransaction extends ITransactionDoc {
  _id: string;
  invoiceId?: string;
  closeInterestRate?: number;
  closeInterest?: number;
  interestRate?: number;
  savingAmount?: number;
  futureDebt?: number;
}

export type savingHistoryQueryResponse = {
  syncSavingsData: IList;
  loading: boolean;
  refetch: () => void;
};

export type PullPolarisConfigsQueryResponse = {
  pullPolarisConfigs: any[];
  loading: boolean;
  refetch: () => void;
};

export type PullPolarisQueryResponse = {
  pullPolarisData: any[];
  loading: boolean;
  refetch: () => void;
};

export type SavingsMutationResponse = {
  sendSaving: (params: { variables: { data: any } }) => Promise<any>;
};

export type SavingsActiveMutationResponse = {
  savingContractActive: (params: {
    variables: { contractNumber: string };
  }) => Promise<any>;
};

export type SendDepositMutationResponse = {
  sendDepositToPolaris: (params: { variables: { data: any } }) => Promise<any>;
};

export type DepositActiveMutationResponse = {
  depositContractActive: (params: {
    variables: { contractNumber: string };
  }) => Promise<any>;
};

export type SavingTransactionMutationResponse = {
  syncSavingTransactions: (params: {
    variables: { data: any };
  }) => Promise<any>;
};

export type DepositTransactionMutationResponse = {
  syncDepositTransactions: (params: {
    variables: { data: any };
  }) => Promise<any>;
};
