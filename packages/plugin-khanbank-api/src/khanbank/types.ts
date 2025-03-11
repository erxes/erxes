export type TransferParams = {
  fromAccount: string;
  toAccount: string;
  amount: number;
  description: string;
  currency: string;

  loginName: string;
  password: string;
  transferid: string;
};

export type KhanbankAccount = {
  number: string;
  type: string;
  currency: string;
  status: string;
  balance: number;
  name: string;
  holdBalance: number;
  availableBalance: number;
  openDate: string;
  homeBranch: string;
  intMethod: string;
  intRate: string;
  homePhone: string;
  businessPhone: string;

  lastMaintenceDate: string;
  lastFinancialTranDate: string;

  intFrom: string;
  intTo: string;
  addr1: string;
};
