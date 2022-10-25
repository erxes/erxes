import { QueryResponse } from '@erxes/ui/src/types';

export interface IAccount {
  _id: string;
  name: string;
  kind: string;
  id: string;
}

export type AccountsQueryResponse = {
  facebookGetAccounts: IAccount[];
  error?: Error;
} & QueryResponse;
