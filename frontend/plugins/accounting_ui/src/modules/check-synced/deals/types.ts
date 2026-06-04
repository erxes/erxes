import { IRecordTableCursorPageInfo } from 'erxes-ui';

export type AccountingCheckSyncedStatus =
  | 'checked'
  | 'synced'
  | 'skipped'
  | 'pending'
  | 'error'
  | 'resynced';

export type AccountingCheckSyncedDeal = {
  _id: string;
  name?: string;
  amount?: unknown;
  number?: string;
  createdAt?: string;
  modifiedAt?: string;
  stageChangedDate?: string;
  isSynced?: boolean;
  syncStatus?: AccountingCheckSyncedStatus;
  syncedDate?: string;
  syncedBillNumber?: string;
  syncedCustomer?: string;
};

export type AccountingCheckSyncedResponse = {
  _id: string;
  isSynced?: boolean;
  syncedDate?: string;
  syncedBillNumber?: string;
  syncedCustomer?: string;
};

export type AccountingSyncResult = {
  skipped?: string[];
  error?: string[];
  success?: string[];
};

export type AccountingDealRuleValue = {
  title?: string;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  returnType?: 'delete' | 'fullTr' | 'onlySale';
};

export type AccountingDealRule = {
  _id: string;
  code: string;
  subId?: string;
  value?: AccountingDealRuleValue;
};

export type AccountingDealsQueryResult = {
  deals?: {
    list: AccountingCheckSyncedDeal[];
    totalCount: number;
    pageInfo?: IRecordTableCursorPageInfo;
  };
};
