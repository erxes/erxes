import { IUser } from 'modules/auth/types';
import { QueryResponse } from 'modules/common/types';

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
} & QueryResponse;

export type ImportHistoryDetailQueryResponse = {
  importHistoryDetail: IImportHistory;
  subscribeToMore: any;
  error: any;
} & QueryResponse;

// mutation types

export type RemoveMutationResponse = {
  importHistoriesRemove: (
    params: { variables: { _id: string } }
  ) => Promise<any>;
};

export type CancelMutationResponse = {
  importCancel: (params: { variables: { _id: string } }) => Promise<any>;
};
