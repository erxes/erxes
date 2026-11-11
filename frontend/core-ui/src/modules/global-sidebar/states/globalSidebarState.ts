import { atomWithStorage } from 'jotai/utils';

// Workspace-wide tools beside every page; records stay in the `?panel=` slot.
export type GlobalSidebarTool = 'assistant';

/** Open tool; device-local and outside the URL, so it survives app tab changes. */
export const globalSidebarToolState = atomWithStorage<GlobalSidebarTool | null>(
  'erxes:global-sidebar-tool',
  null,
  undefined,
  { getOnInit: true },
);
