import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';

export const notFoundLocationState = atom<string | null>(null);

/**
 * The last URL (path + query) visited in each app, keyed by navigation
 * activity id, so switching back to an app tab resumes where the user left
 * it — like a browser tab.
 */
export const appLastLocationState = atomWithStorage<Record<string, string>>(
  'navigation:app-last-location',
  {},
  undefined,
  { getOnInit: true },
);
