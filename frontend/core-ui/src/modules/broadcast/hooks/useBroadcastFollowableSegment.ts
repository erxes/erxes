import { useSegmentTimeSensitive } from '@/segments/hooks/useSegmentTimeSensitive';

/**
 * Whether this audience can start the campaign itself: exactly one segment,
 * and one the clock moves, so it has a nightly refresh to follow.
 */
export const useBroadcastFollowableSegment = (
  targetType?: string,
  targetIds?: string[],
) => {
  const segmentId =
    targetType === 'segment' && targetIds?.length === 1
      ? targetIds[0]
      : undefined;

  const { timeSensitive } = useSegmentTimeSensitive(segmentId);

  return { canFollowSegment: !!segmentId && timeSensitive };
};
