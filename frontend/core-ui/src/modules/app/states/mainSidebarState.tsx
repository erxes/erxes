import { atomWithStorage } from 'jotai/utils';

export type SidebarCollapseState = 'expanded' | 'compact' | 'collapsed';

export const mainSidebarCollapseState = atomWithStorage<SidebarCollapseState>(
  'mainSidebarCollapseState',
  'expanded',
  undefined,
  {
    getOnInit: true,
  },
);
