import { atomWithStorage } from 'jotai/utils';

export type SidebarCollapseState = 'expanded' | 'collapsed';
export type SidebarStorageState = SidebarCollapseState | 'compact';

export const mainSidebarCollapseState = atomWithStorage<SidebarStorageState>(
  'mainSidebarCollapseState',
  'expanded',
  undefined,
  {
    getOnInit: true,
  },
);
