export interface IGolomtBankConfigsItem {
  _id: string;
  name: string;
  organizationName: string;
  clientId: string;
  ivKey: string;
  sessionKey: string;
  configPassword: string;
  registerId: string;
  accountId: string;
  golomtCode: string;
  apiUrl: string;
}

export type ConfigsListQueryResponse = {
  golomtBankConfigsList: {
    list: IGolomtBankConfigsItem[];
    totalCount: number;
  };

  loading: boolean;
  refetch: () => void;
};
