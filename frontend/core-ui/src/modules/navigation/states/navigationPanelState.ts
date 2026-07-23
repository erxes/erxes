import { atomWithStorage } from 'jotai/utils';

export const navigationPanelOpenState = atomWithStorage<boolean>(
  'navigation:panel-open',
  true,
  undefined,
  {
    getOnInit: true,
  },
);
