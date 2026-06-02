export type CheckSyncedDealStatus =
  | 'skipped'
  | 'checked'
  | 'synced'
  | 'pending'
  | 'error'
  | 'resynced';

export interface ICheckSyncedDeals {
  _id: string;
  name: string;
  amount: unknown;
  number: string;
  createdAt: string;
  stageChangedDate: string;
  unSynced?: string;
  isSynced?: boolean;
  syncStatus?: CheckSyncedDealStatus;
  syncedDate?: string;
  syncedBillNumber?: string;
  syncedCustomer?: string;
  __typename: string;
}

export interface ICheckSyncedDealsSync {
  _id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  number: number;
  modifiedAt: Date;
  modifiedBy: string;
  amount: number;
  sendData: string;
  sendStr: string;
  responseData: string;
  responseStr: string;
  error: string;
  content: string;
}
