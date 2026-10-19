import { atomWithStorage } from 'jotai/utils';

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
