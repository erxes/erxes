import { QueryResponse } from "@erxes/ui/src/types";

export interface IGolomtBankTransactionInput {
  refCode: string;
  accountId: string;
  toAccountName: string;
  receiveAccount: string;
  bankCode: string;
  toBank: string;
  toCurrency: string;
  description: string;
  currency: string;
  amount: number;
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
} & QueryResponse;
