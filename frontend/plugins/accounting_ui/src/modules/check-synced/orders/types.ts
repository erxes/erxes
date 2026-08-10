import {
  AccountingCheckSyncedResponse,
  AccountingCheckSyncedStatus,
  AccountingSyncResult,
} from '../deals/types';

export type AccountingCheckSyncedOrder = {
  _id: string;
  createdAt?: string;
  paidDate?: string;
  number?: string;
  totalAmount?: number;
  isSynced?: boolean;
  syncStatus?: AccountingCheckSyncedStatus;
  syncedDate?: string;
  syncedBillNumber?: string;
  syncedCustomer?: string;
};

export type AccountingOrderRuleValue = {
  title?: string;
  posId?: string;
  returnType?: 'delete' | 'fullTr' | 'onlySale';
};

export type AccountingOrderRule = {
  _id: string;
  code: string;
  subId?: string;
  value?: AccountingOrderRuleValue;
};

export type AccountingOrdersQueryResult = {
  posOrders?: AccountingCheckSyncedOrder[];
  posOrdersTotalCount?: number;
};

export type {
  AccountingCheckSyncedResponse,
  AccountingCheckSyncedStatus,
  AccountingSyncResult,
};
