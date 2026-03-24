import { useQuery } from '@apollo/client';
import { SEGMENT_DETAIL } from 'ui-modules/modules/segments/graphql/queries';
import { ISegment } from 'ui-modules/modules/segments/types';

export const useSegmentDetail = (segmentId?: string) => {
  const {
    data,
    loading: segmentLoading,
    refetch,
  } = useQuery<{
    segmentDetail: ISegment;
  }>(SEGMENT_DETAIL, {
    variables: { _id: segmentId },
    skip: !segmentId,
  });

  const segment = segmentId ? data?.segmentDetail : undefined;

  return {
    segment,
    segmentLoading,
    refetch,
  };
};
