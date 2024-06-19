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
  receivesGenericType: string;
  receivesAcctName: string;
  receivesAcctNo: string;
  receivesAmountValue: number;
  receivesAmountCurrency: string;
  receivesParticulars: string;
  receivesBank: string;
  receivesRemarks: string;
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
