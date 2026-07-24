export type TransferParams = {
  type: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  description: string;
  fromCurrency: string;
  toCurrency: string;
  toAccountName: string;
  fromAccountName: string;
  toBank: string;
  refCode: string;
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
};
