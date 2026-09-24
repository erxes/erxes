import { atomWithStorage, createJSONStorage } from 'jotai/utils';

/**
 * Customers picked in the contacts list for a campaign being started. Kept in
 * session storage so a reload of the open sheet keeps its audience; the list
 * can be far longer than a URL should carry.
 */
export const broadcastContactsState = atomWithStorage<string[]>(
  'broadcast:contacts',
  [],
  createJSONStorage(() => sessionStorage),
  { getOnInit: true },
);
