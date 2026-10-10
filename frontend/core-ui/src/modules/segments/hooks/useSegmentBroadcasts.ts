import { SEGMENT_BROADCASTS } from '@/segments/graphql/segmentBroadcastsQueries';
import { useQuery } from '@apollo/client';
import { ISegment } from 'ui-modules';

export type TSegmentBroadcast = {
  _id: string;
  title?: string;
  isLive?: boolean;
  isDraft?: boolean;
  scheduleDate?: { type?: string } | null;
};

const SEGMENT_BROADCASTS_LIMIT = 50;

/** The broadcasts that go to this segment's members. */
export const useSegmentBroadcasts = (segment?: ISegment) => {
  const { data, loading } = useQuery<{
    engageMessages?: { list?: TSegmentBroadcast[] };
  }>(SEGMENT_BROADCASTS, {
    variables: { segmentId: segment?._id, limit: SEGMENT_BROADCASTS_LIMIT },
    skip: !segment?._id,
    // Broadcasts are edited elsewhere; coming back must show the change.
    fetchPolicy: 'cache-and-network',
  });

  return {
    broadcasts: data?.engageMessages?.list || [],
    loading: loading && !data,
  };
};
