import type { ErkhetCheckPosOrdersQuery } from '~/gql/graphql';

export type CheckPosOrderStatus =
  | 'skipped'
  | 'checked'
  | 'synced'
  | 'pending'
  | 'error'
  | 'resynced';

type PosOrderRow = NonNullable<
  NonNullable<ErkhetCheckPosOrdersQuery['posOrders']>[number]
>;

export type ICheckPosOrders = Omit<PosOrderRow, '_id'> & {
  _id: string;
  unSynced?: string;
  isSynced?: boolean | null;
  syncStatus?: CheckPosOrderStatus;
  syncedDate?: string | null;
  syncedBillNumber?: string | null;
  syncedCustomer?: string | null;
};

export interface ICheckPosOrdersSync {
  _id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  orderNumber: number;
  modifiedAt: Date;
  modifiedBy: string;
}
