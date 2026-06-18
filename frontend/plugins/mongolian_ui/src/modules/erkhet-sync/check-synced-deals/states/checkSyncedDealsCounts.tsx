import { atom } from 'jotai';

export const checkSyncedDealsTotalCountAtom = atom<number | null>(null);

export type CheckSyncedDealsStatusCounts = {
  checked: number;
  synced: number;
  skipped: number;
  pending: number;
  error: number;
  resynced: number;
  toSync: number;
};

export const checkSyncedDealsStatusCountsAtom =
  atom<CheckSyncedDealsStatusCounts>({
    checked: 0,
    synced: 0,
    skipped: 0,
    pending: 0,
    error: 0,
    resynced: 0,
    toSync: 0,
  });
