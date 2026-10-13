import { GET_MILESTONES_INLINE } from '@/project/graphql/queries/getMilestones';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/operation/utils/cursorList';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';
import type {
  GetMilestonesQuery,
  GetMilestonesQueryVariables,
} from '~/gql/graphql';

export const useMilestones = (
  projectId?: string | null,
  options?: Omit<
    QueryHookOptions<GetMilestonesQuery, GetMilestonesQueryVariables>,
    'variables'
  > & {
    variables?: Omit<GetMilestonesQueryVariables, 'projectId'>;
  },
) => {
  const { data, loading, fetchMore } = useQuery(GET_MILESTONES_INLINE, {
    ...options,
    skip: options?.skip || !projectId,
    variables: projectId ? { ...options?.variables, projectId } : undefined,
  });

  const milestones = data?.milestones?.list
    ? compactList(data.milestones.list)
    : undefined;
  const pageInfo = toCursorPageInfo(data?.milestones?.pageInfo);
  const totalCount = data?.milestones?.totalCount;

  const handleFetchMore = (
    direction: EnumCursorDirection = EnumCursorDirection.FORWARD,
  ) => {
    if (!projectId || !validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        ...options?.variables,
        projectId,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: 20,
        direction:
          direction === EnumCursorDirection.FORWARD ? 'forward' : 'backward',
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.milestones || !prev.milestones) return prev;

        return {
          ...prev,
          milestones: mergeCursorList(
            direction,
            prev.milestones,
            fetchMoreResult.milestones,
          ),
        };
      },
    });
  };

  return { milestones, loading, handleFetchMore, totalCount };
};
