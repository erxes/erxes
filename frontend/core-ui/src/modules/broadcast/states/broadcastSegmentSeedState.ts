import { atomWithStorage, createJSONStorage } from 'jotai/utils';

/**
 * The segment a campaign is being started to follow, when started from that
 * segment. Kept in session storage so a reload of the open sheet keeps it.
 */
export const broadcastSegmentSeedState = atomWithStorage<string | null>(
  'broadcast:followSegment',
  null,
  createJSONStorage(() => sessionStorage),
  { getOnInit: true },
);
