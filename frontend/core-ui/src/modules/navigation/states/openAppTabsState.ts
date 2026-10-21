import { atomWithStorage } from 'jotai/utils';

/**
 * Open app tabs in the top bar, in the user's order (activity ids). `null`
 * until the user first opens, closes or moves a tab: then every plugin is
 * open by default.
 */
export const openAppTabsState = atomWithStorage<string[] | null>(
  'navigation:open-app-tabs',
  null,
  undefined,
  { getOnInit: true },
);
