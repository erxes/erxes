import { atomWithStorage } from 'jotai/utils';

export const navigationPanelOpenState = atomWithStorage<boolean>(
  'navigationPanelOpen',
  true,
  undefined,
  {
    getOnInit: true,
  },
);

export const navigationTabsState = atomWithStorage<string[]>(
  'navigationTabs',
  [],
  undefined,
  {
    getOnInit: true,
  },
);
