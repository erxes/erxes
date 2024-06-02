import { QueryResponse } from '@erxes/ui/src/types';

export interface IGolomtBankConfigsItem {
  _id: string;
  name: string;
  userName: string;
  organizationName: string;
  ivKey: string;
  clientId: string;
  sessionKey: string;
  password: string
}

export type ConfigsListQueryResponse = {
  golomtBankConfigsList: {
    list: IGolomtBankConfigsItem[];
    totalCount: number;
  };

  loading: boolean;
  refetch: () => void;
} & QueryResponse;
