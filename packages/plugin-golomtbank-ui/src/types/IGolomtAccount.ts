import { QueryResponse } from '@erxes/ui/src/types';

export interface IAccountHolder {
  number: string;
  custLastName: string;
  custFirstName: string;
  currency: string;
}

export interface IGolomtBankAccount {
  requestId: string,
  accountId: string,
  accountName: string,
  shortName: string
  currency: string
  branchId: string
  isSocialPayConnected: string
  accountType: {
    schemeCode: string
    schemeType: string
  }

}

export type AccountsListQueryResponse = {
  golomtBankAccounts: IGolomtBankAccount[];

  loading: boolean;
  refetch: () => void;
} & QueryResponse;

export type AccountDetailQueryResponse = {
  golomtBankAccountDetail: IGolomtBankAccount;

  loading: boolean;
  refetch: () => void;
} & QueryResponse;
