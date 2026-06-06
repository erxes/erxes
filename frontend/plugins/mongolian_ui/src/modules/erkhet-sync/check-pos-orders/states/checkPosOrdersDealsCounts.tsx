import { atom } from 'jotai';

export const checkPosOrdersTotalCountAtom = atom<number | null>(null);

export type CheckPosOrdersStatusCounts = {
  checked: number;
  synced: number;
  skipped: number;
  pending: number;
  error: number;
  resynced: number;
  toSync: number;
};

export const checkPosOrdersStatusCountsAtom = atom<CheckPosOrdersStatusCounts>({
  checked: 0,
  synced: 0,
  skipped: 0,
  pending: 0,
  error: 0,
  resynced: 0,
  toSync: 0,
});
