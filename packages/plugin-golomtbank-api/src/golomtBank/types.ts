export type TransferParams = {
  genericType: string;
  registerNumber: string;
  type: string;
  refCode: string;
  initiatorGenericType: string;
  initiatorAcctName: string;
  initiatorAcctNo: string;
  initiatorAmountValue: number;
  initiatorAmountCurrency: string;
  initiatorParticulars: string;
  initiatorBank: string;
  receives: [JSON];
};
export type receive = {
  genericType: string;
  acctName: string;
  acctNo: string;
  amount: {
    value: number;
    currency: string;
  };
  particulars: string;
  bank: string;
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
