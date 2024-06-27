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

export type GolomtBankAccount = {
  requestId: string;
  accountId: string;
  accountName: string;
  shortName: string;
  currency: string;
  branchId: string;
  isSocialPayConnected: string;
  accountType: string;
  
}
