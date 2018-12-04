import { TwitterAuthParams } from '../integrations/types';

export interface IAccount {
  _id: string;
  name: string;
  kind: string;
  id: string;
}

// query types

export type AccountsQueryResponse = {
  accounts: IAccount[];
  loading: boolean;
  refetch: () => void;
};

// mutation types

export type RemoveMutationResponse = {
  removeAccount: (params: { variables: { _id: string } }) => Promise<any>;
};

export type LinkTwitterMutationResponse = {
  accountsAddTwitter: (
    { queryParams }: { queryParams: TwitterAuthParams }
  ) => Promise<any>;
};
