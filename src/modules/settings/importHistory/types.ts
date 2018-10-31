import { IUser } from 'modules/auth/types';

export interface IImportHistory {
  _id: string;
  success: string;
  failed: string;
  total: string;
  contentType: string;
  date: Date;
  user: IUser;
}

// query types

export type ImportHistoriesQueryResponse = {
  importHistories: IImportHistory[];
  loading: boolean;
  refetch: () => void;
};

// mutation types

export type RemoveMutationResponse = {
  importHistoriesRemove: (
    params: { variables: { _id: string } }
  ) => Promise<any>;
};
