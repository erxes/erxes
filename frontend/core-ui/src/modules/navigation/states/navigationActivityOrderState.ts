import { atomWithStorage } from 'jotai/utils';

/**
 * The user's order of plugins and core modules in the app switcher (activity
 * ids). Ids not listed keep their default order after the listed ones.
 */
export const navigationActivityOrderState = atomWithStorage<string[]>(
  'navigation:activity-order',
  [],
  undefined,
  { getOnInit: true },
);
