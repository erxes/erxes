import { atomWithStorage } from 'jotai/utils';

export const navigationActivityOrderState = atomWithStorage<string[] | null>(
  'navigation:activity-order',
  null,
  undefined,
  { getOnInit: true },
);
