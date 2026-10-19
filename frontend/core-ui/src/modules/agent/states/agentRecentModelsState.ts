import { atomWithStorage } from 'jotai/utils';

/** Device-local convenience only; the picker intersects these with the live catalog. */
export const agentRecentModelsState = atomWithStorage<string[]>(
  'agent:recent-models',
  [],
  undefined,
  { getOnInit: true },
);
