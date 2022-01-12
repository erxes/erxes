import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';

export type IConfigsMap = { [key: string]: any };

export type IConfig = {
  _id: string;
  code: string;
  value: any;
};

// query types
export type ConfigsQueryResponse = {
  configs: IConfig[];
  loading: boolean;
  refetch: () => void;
};

export type UsersQueryResponse = {
  users: IUser[];
} & QueryResponse;
