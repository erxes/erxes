import { IUser } from 'modules/auth/types';

export interface IImportHistory {
  _id: string;
  success: string;
  failed: string;
  total: string;
  contentType: string;
  date: Date;
  user: IUser;
  status: string;
  percentage: number;
  errorMsgs: string[];
}

export interface IImportHistoryItem {
  list: IImportHistory[];
  count: number;
}
// query types

export type ImportHistoriesQueryResponse = {
  importHistories: IImportHistoryItem;
  loading: boolean;
  refetch: () => void;
};

export type ImportHistoryDetailQueryResponse = {
  importHistoryDetail: IImportHistory;
  loading: boolean;
  subscribeToMore: any;
  error: any;
  refetch: () => void;
};

// mutation types

export type RemoveMutationResponse = {
  importHistoriesRemove: (
    params: { variables: { _id: string } }
  ) => Promise<any>;
};

export type CancelMutationResponse = {
  importCancel: (params: { variables: { _id: string } }) => Promise<any>;
};
