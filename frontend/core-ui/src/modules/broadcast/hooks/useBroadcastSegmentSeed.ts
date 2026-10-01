import { useAtom } from 'jotai';
import { broadcastSegmentSeedState } from '../states/broadcastSegmentSeedState';

/** The segment a new campaign follows, when started from that segment. */
export const useBroadcastSegmentSeed = () => {
  const [segmentId, setSegmentId] = useAtom(broadcastSegmentSeedState);

  return {
    seedSegmentId: segmentId,
    setSeedSegment: setSegmentId,
    clearSeedSegment: () => setSegmentId(null),
  };
};
