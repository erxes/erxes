import { SEGMENT_TIME_SENSITIVE } from '@/segments/graphql/segmentTimeSensitiveQueries';
import { useQuery } from '@apollo/client';

/** Whether the clock moves this segment's members, so it is rebuilt nightly. */
export const useSegmentTimeSensitive = (segmentId?: string) => {
  const { data, loading } = useQuery<{
    segmentDetail?: { _id: string; timeSensitive?: boolean | null } | null;
  }>(SEGMENT_TIME_SENSITIVE, {
    variables: { _id: segmentId },
    skip: !segmentId,
    fetchPolicy: 'cache-first',
  });

  return {
    timeSensitive: !!data?.segmentDetail?.timeSensitive,
    loading,
  };
};
