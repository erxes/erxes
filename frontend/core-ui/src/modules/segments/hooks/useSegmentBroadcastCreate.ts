import { useBroadcastSegmentSeed } from '@/broadcast/hooks/useBroadcastSegmentSeed';
import { useSegmentTimeSensitive } from '@/segments/hooks/useSegmentTimeSensitive';
import { useNavigate } from 'react-router';
import { ISegment } from 'ui-modules';

/** Opens a workflow broadcast that this segment's nightly refresh sends. */
export const useSegmentBroadcastCreate = (segment?: ISegment) => {
  const navigate = useNavigate();
  const { setSeedSegment } = useBroadcastSegmentSeed();
  const { timeSensitive } = useSegmentTimeSensitive(segment?._id);

  const createBroadcast = () => {
    if (!segment?._id || !timeSensitive) {
      return;
    }

    setSeedSegment(segment._id);
    navigate('/broadcasts?method=workflow');
  };

  return { canCreate: timeSensitive, createBroadcast };
};
