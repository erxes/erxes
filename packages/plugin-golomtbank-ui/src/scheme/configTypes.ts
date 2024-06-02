import { QueryResponse } from '@erxes/ui/src/types';

export interface IGolomtBankConfigsItem {
  _id: string;
  userName: string;
  organizationName: string;
  clientId: string;
  ivKey: string;
  sessionKey: string;
  password: string;
  registerId: string
}

export type ConfigsListQueryResponse = {
  golomtBankConfigsList: {
    list: IGolomtBankConfigsItem[];
    totalCount: number;
  };

  loading: boolean;
  refetch: () => void;
} & QueryResponse;
