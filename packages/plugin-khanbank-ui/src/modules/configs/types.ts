import { IUser } from '@erxes/ui/src/auth/types';
import { IDepartment } from '@erxes/ui/src/team/types';
import { QueryResponse } from '@erxes/ui/src/types';

export interface IKhanbankConfigsItem {
  _id: string;
  name: string;
  description: string;

  consumerKey: string;
  secretKey: string;
}

export type ConfigsListQueryResponse = {
  khanbankConfigsList: {
    list: IKhanbankConfigsItem[];
    totalCount: number;
  };

  loading: boolean;
  refetch: () => void;
} & QueryResponse;
