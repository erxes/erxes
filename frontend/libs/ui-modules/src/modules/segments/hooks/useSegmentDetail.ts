import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { SEGMENT_DETAIL } from 'ui-modules/modules/segments/graphql/queries';
import { ISegment } from 'ui-modules/modules/segments/types';

/** How often a running rebuild is re-read, so its progress visibly moves. */
const BUILD_POLL_MS = 2000;

export const useSegmentDetail = (segmentId?: string) => {
  const {
    data,
    loading: segmentLoading,
    refetch,
    startPolling,
    stopPolling,
  } = useQuery<{ segmentDetail: ISegment }>(SEGMENT_DETAIL, {
    variables: { _id: segmentId },
    skip: !segmentId,
  });

  const building = data?.segmentDetail?.status === 'building';

  // Polled only while a build is actually running, and stopped the moment it
  // ends - watching a settled segment would be a request every two seconds for
  // an answer that cannot change.
  useEffect(() => {
    if (!building) {
      stopPolling();
      return;
    }

    startPolling(BUILD_POLL_MS);

    return () => stopPolling();
  }, [building, startPolling, stopPolling]);

  const segment = segmentId ? data?.segmentDetail : undefined;

  return {
    segment,
    segmentLoading,
    refetch,
  };
};
