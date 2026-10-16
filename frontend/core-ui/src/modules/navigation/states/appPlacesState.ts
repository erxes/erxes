import { atomWithStorage } from 'jotai/utils';

/** Last page visited in each app, keyed by navigation activity id. */
export const appPlacesState = atomWithStorage<Record<string, string>>(
  'navigation:app-places',
  {},
  undefined,
  { getOnInit: true },
);

export const lastAppIdState = atomWithStorage<string | null>(
  'navigation:last-app',
  null,
  undefined,
  { getOnInit: true },
);

/** Pages visited inside apps, newest first. */
export const recentPagesState = atomWithStorage<
  { to: string; visitedAt: number }[]
>('navigation:recent-pages', [], undefined, { getOnInit: true });
