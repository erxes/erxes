import { GET_MILESTONES_INLINE } from '@/project/graphql/queries/getMilestones';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/operation/utils/cursorList';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';
import { useParams } from 'react-router-dom';
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
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const id = projectId ?? paramProjectId;

  const { data, loading, fetchMore } = useQuery(GET_MILESTONES_INLINE, {
    ...options,
    skip: options?.skip || !id,
    variables: id ? { ...options?.variables, projectId: id } : undefined,
  });

  const milestones = data?.milestones?.list
    ? compactList(data.milestones.list)
    : undefined;
  const pageInfo = toCursorPageInfo(data?.milestones?.pageInfo);
  const totalCount = data?.milestones?.totalCount;

  const handleFetchMore = (
    direction: EnumCursorDirection = EnumCursorDirection.FORWARD,
  ) => {
    if (!id || !validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        ...options?.variables,
        projectId: id,
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
