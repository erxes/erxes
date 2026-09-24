import { atomWithStorage } from 'jotai/utils';

export type TBroadcastListLayout = 'list' | 'grid' | 'calendar';

/**
 * Layout survives leaving the list, because entry points back into
 * `/broadcasts` (the sidebar, a closed sheet) carry no query string.
 */
export const broadcastListLayoutState = atomWithStorage<TBroadcastListLayout>(
  'broadcast:list-layout',
  'list',
  undefined,
  { getOnInit: true },
);
