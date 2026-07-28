export interface IAccountHolder {
  number: string;
  custLastName: string;
  custFirstName: string;
  currency: string;
}

export interface IKhanbankAccount {
  number: string;
  ibanAcctNo: string;
  type: string;
  currency: string;
  status: string;
  balance: number;
  name: string;
  holdBalance: number;
  availableBalance: number;

  openDate: string;
  lastMaintenceDate: string;
  lastFinancialTranDate: string;
  intTo: string;
  intRate: string;
  intMethod: string;
  intFrom: string;

  homePhone: string;
  homeBranch: string;
  holderInfo: IAccountHolder;
  businessPhone: string;
  addr1: string;
}

export type AccountsListQueryResponse = {
  khanbankAccounts: IKhanbankAccount[];

  loading: boolean;
  refetch: () => void;
};

export type AccountDetailQueryResponse = {
  khanbankAccountDetail: IKhanbankAccount;

  loading: boolean;
  refetch: () => void;
};
