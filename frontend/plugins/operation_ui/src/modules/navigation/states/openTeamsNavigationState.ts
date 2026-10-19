import { atomWithStorage } from 'jotai/utils';

/**
 * Team ids expanded in the sidebar's "Your teams" group. Kept outside the
 * component so the choice survives the sidebar remounting (switching apps,
 * reloads).
 */
export const openTeamsNavigationState = atomWithStorage<string[]>(
  'operation:open-teams-navigation',
  [],
  undefined,
  { getOnInit: true },
);
