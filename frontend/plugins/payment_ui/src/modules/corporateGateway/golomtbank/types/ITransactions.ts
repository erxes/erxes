export interface IGolomtBankTransactionInput {
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
}
export interface IGolomtBankTransactionItem {
  requestId: string;
  recNum: string;
  tranId: string;
  tranDate: string;
  drOrCr: string;
  tranAmount: number;
  tranDesc: string;
  tranPostedDate: string;
  tranCrnCode: string;
  exchRate: number;
  balance: number;
  accName: string;
  accNum: string;
}

export interface IGolomtBankStatement {
  requestId: string;
  accountId: string;
  statements: IGolomtBankTransactionItem[];
}

export type StatementQueryResponse = {
  golomtBankStatements: IGolomtBankStatement;

  loading: boolean;
  refetch: () => void;
};
