import { GET_MILESTONES_INLINE } from '@/project/graphql/queries/getMilestones';
import { IMilestone } from '@/project/types';
import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { useParams } from 'react-router-dom';

export const useMilestones = (
  options?: QueryHookOptions<ICursorListResponse<IMilestone>>,
) => {
  const { projectId } = useParams<{ projectId: string }>();

  const { data, loading, fetchMore } = useQuery(GET_MILESTONES_INLINE, {
    ...options,
    variables: { projectId, ...options?.variables },
  });

  const { list: milestones, pageInfo, totalCount } = data?.milestones || {};

  const handleFetchMore = (
    direction: EnumCursorDirection = EnumCursorDirection.FORWARD,
  ) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        ...options?.variables,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: 20,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          milestones: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.milestones,
            prevResult: prev.milestones,
          }),
        });
      },
    });
  };

  return { milestones, loading, handleFetchMore, totalCount };
};
