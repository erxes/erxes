import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const navigationSidebarOpenState = atomWithStorage<boolean>(
  'navigation:panel-open',
  true,
  undefined,
  {
    getOnInit: true,
  },
);

export const expandedNavigationActivityState = atomWithStorage<string[]>(
  'navigation:expanded-activities',
  [],
  undefined,
  {
    getOnInit: true,
  },
);

export const navigationActivityItemCountsState = atomWithStorage<
  Record<string, number>
>('navigation:activity-item-counts', {}, undefined, {
  getOnInit: true,
});

export const navigationSidebarWidthState = atomWithStorage<number | null>(
  'navigation:sidebar-width',
  null,
  undefined,
  { getOnInit: true },
);

export const navigationContextOpenState = atomWithStorage<boolean>(
  'navigation:context-open',
  true,
  undefined,
  { getOnInit: true },
);

export const navigationContextWidthState = atomWithStorage<number | null>(
  'navigation:context-width',
  null,
  undefined,
  { getOnInit: true },
);

export const navigationResizingState = atom(false);
