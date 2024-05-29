import { QueryResponse } from "@erxes/ui/src/types"


export interface  IGolomtAccount  {
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
  golomtBankAccounts: IGolomtAccount[];

  loading: boolean;
  refetch: () => void;
} & QueryResponse;

export type AccountDetailQueryResponse = {
  golomtBankAccountDetail: IGolomtAccount;

  loading: boolean;
  refetch: () => void;
} & QueryResponse;