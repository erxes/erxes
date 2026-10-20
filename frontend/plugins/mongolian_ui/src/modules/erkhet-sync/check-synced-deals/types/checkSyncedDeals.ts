import type { ErkhetCheckSyncedDealsQuery } from '~/gql/graphql';

export type CheckSyncedDealStatus =
  | 'skipped'
  | 'checked'
  | 'synced'
  | 'pending'
  | 'error'
  | 'resynced';

type DealRow = NonNullable<
  NonNullable<NonNullable<ErkhetCheckSyncedDealsQuery['deals']>['list']>[number]
>;

export type ICheckSyncedDeals = DealRow & {
  unSynced?: string;
  isSynced?: boolean | null;
  syncStatus?: CheckSyncedDealStatus;
  syncedDate?: string | null;
  syncedBillNumber?: string | null;
  syncedCustomer?: string | null;
};

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
