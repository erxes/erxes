export type CheckPosOrderStatus =
  | 'skipped'
  | 'checked'
  | 'synced'
  | 'pending'
  | 'error'
  | 'resynced';

export interface ICheckPosOrders {
  _id: string;
  number: string;
  totalAmount: string;
  createdAt: string;
  paidDate: string;
  unSynced?: string;
  isSynced?: boolean;
  syncStatus?: CheckPosOrderStatus;
  syncedDate?: string;
  syncedBillNumber?: string;
  syncedCustomer?: string;
  __typename: string;
}

export interface ICheckPosOrdersSync {
  _id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  orderNumber: number;
  modifiedAt: Date;
  modifiedBy: string;
}
