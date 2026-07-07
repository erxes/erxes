export interface IAccountHolder {
  number: string;
  custLastName: string;
  custFirstName: string;
  currency: string;
}

export interface IGolomtBankAccount {
  requestId: string;
  accountId: string;
  accountName: string;
  shortName: string;
  currency: string;
  branchId: string;
  isSocialPayConnected: string;
  accountType: {
    schemeCode: string;
    schemeType: string;
  };
}
export interface IGolomtBankAccountDetail {
  requestId: string;
  accountNumber: string;
  currency: string;
  customerName: string;
  titlePrefix: string;
  accountName: string;
  accountShortName: string;
  freezeStatusCode: string;
  freezeReasonCode: string;
  openDate: string;
  status: string;
  productName: string;
  type: string;
  intRate: string;
  isRelParty: string;
  branchId: string;
}
export interface IGolomtBankAccountBalance {
  currency: string;
  balanceLL?: [any];
}
export type AccountsListQueryResponse = {
  golomtBankAccounts: [any];
  loading: boolean;
  refetch: () => void;
};

export type AccountDetailQueryResponse = {
  golomtBankAccountDetail: IGolomtBankAccountDetail;

  loading: boolean;
  refetch: () => void;
};

export type AccountBalanceQueryResponse = {
  golomtBankAccountBalance: IGolomtBankAccountBalance;

  loader: boolean;
  refetch: () => void;
};
