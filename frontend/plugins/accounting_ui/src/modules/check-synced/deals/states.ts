import { atom } from 'jotai';
import { AccountingCheckSyncedStatus } from './types';

export type AccountingCheckSyncedDealsStatusCounts = Record<
  AccountingCheckSyncedStatus | 'toSync',
  number
>;

export const accountingCheckSyncedDealsTotalCountAtom = atom<number | null>(
  null,
);

export const accountingCheckSyncedDealsStatusCountsAtom =
  atom<AccountingCheckSyncedDealsStatusCounts>({
    checked: 0,
    synced: 0,
    skipped: 0,
    pending: 0,
    error: 0,
    resynced: 0,
    toSync: 0,
  });
