import { atomWithStorage } from 'jotai/utils';

export const sidebarPanelOpenState = atomWithStorage<boolean>(
  'sidebar:panel-open',
  true,
  undefined,
  { getOnInit: true },
);
