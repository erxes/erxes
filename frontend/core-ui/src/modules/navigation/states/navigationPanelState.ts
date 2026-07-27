import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type NavigationPanelView = 'activity' | 'favorites';

export const navigationSidebarOpenState = atomWithStorage<boolean>(
  'navigation:panel-open',
  true,
  undefined,
  {
    getOnInit: true,
  },
);

export const navigationPanelViewState = atom<NavigationPanelView>('activity');

export const navigationPanelOpenState = atomWithStorage<boolean>(
  'navigation:plugin-panel-open',
  true,
  undefined,
  {
    getOnInit: true,
  },
);
