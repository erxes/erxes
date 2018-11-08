export interface ILinkedAccount {
  _id: string;
  accountId: string;
  accountName: string;
  kind: string;
}

// query types

export type LinkedAccountsQueryResponse = {
  integrationLinkedAccounts: ILinkedAccount[];
  loading: boolean;
  refetch: () => void;
};

// mutation types

export type RemoveMutationResponse = {
  integrationsDelinkAccount: (
    params: { variables: { _id: string } }
  ) => Promise<any>;
};
