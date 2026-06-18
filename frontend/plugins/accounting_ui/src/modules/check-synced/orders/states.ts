import { atom } from 'jotai';
import { AccountingCheckSyncedStatus } from './types';

export type AccountingCheckSyncedOrdersStatusCounts = Record<
  AccountingCheckSyncedStatus | 'toSync',
  number
>;

export const accountingCheckSyncedOrdersTotalCountAtom = atom<number | null>(
  null,
);

export const accountingCheckSyncedOrdersStatusCountsAtom =
  atom<AccountingCheckSyncedOrdersStatusCounts>({
    checked: 0,
    synced: 0,
    skipped: 0,
    pending: 0,
    error: 0,
    resynced: 0,
    toSync: 0,
  });
