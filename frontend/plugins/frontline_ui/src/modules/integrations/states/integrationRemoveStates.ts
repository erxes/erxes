import { atom } from 'jotai';

/** Integrations whose remove is in flight; their rows are locked meanwhile. */
export const removingIntegrationIdsAtom = atom<string[]>([]);
