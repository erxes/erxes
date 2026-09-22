import { atomWithStorage } from 'jotai/utils';

export const navigationSidebarOpenState = atomWithStorage<boolean>(
  'navigation:panel-open',
  true,
  undefined,
  {
    getOnInit: true,
  },
);

export const navigationPanelOpenState = atomWithStorage<boolean>(
  'navigation:plugin-panel-open',
  true,
  undefined,
  {
    getOnInit: true,
  },
);
