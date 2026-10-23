import { atomWithStorage } from 'jotai/utils';

/**
 * The user's order of favorites in the app chooser (favorite paths).
 * Favorites not listed keep their default order after the listed ones.
 */
export const favoriteOrderState = atomWithStorage<string[]>(
  'navigation:favorite-order',
  [],
  undefined,
  { getOnInit: true },
);
