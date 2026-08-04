import { useQuery } from '@apollo/client';
import { useMemo, useCallback, useEffect } from 'react';
import {
  useMultiQueryState,
  useRecordTableCursor,
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { assignmentTotalCountAtom } from '../states/assignmentCounts';
import { ASSIGNMENTS_QUERY } from '../graphql/queries';
import { IAssignmentItem } from '../types/assignment';

const ASSIGNMENT_PER_PAGE = 30;
export const ASSIGNMENT_CURSOR_SESSION_KEY = 'assignments_cursor';

export const useAssignmentList = () => {
  const setTotalCount = useSetAtom(assignmentTotalCountAtom);

  const [
    {
      assignmentCampaignId,
      assignmentStatus,
      assignmentOwnerType,
      assignmentOwnerId,
    },
  ] = useMultiQueryState<{
    assignmentCampaignId: string;
    assignmentStatus: string;
    assignmentOwnerType: string;
    assignmentOwnerId: string;
  }>([
    'assignmentCampaignId',
    'assignmentStatus',
    'assignmentOwnerType',
    'assignmentOwnerId',
  ]);

  const variables = {
    limit: ASSIGNMENT_PER_PAGE,
    campaignId: assignmentCampaignId || undefined,
    status: assignmentStatus || undefined,
    ownerId: assignmentOwnerId || undefined,
    ownerType: assignmentOwnerType || undefined,
  };

  const { cursor } = useRecordTableCursor({
    sessionKey: ASSIGNMENT_CURSOR_SESSION_KEY,
  });

  const { data, loading, fetchMore } = useQuery(ASSIGNMENTS_QUERY, {
    variables: { ...variables, cursor },
    notifyOnNetworkStatusChange: true,
  });

  const list = useMemo<IAssignmentItem[]>(
    () => data?.assignments?.list || [],
    [data?.assignments?.list],
  );

  const totalCount = useMemo(
    () => data?.assignments?.totalCount || 0,
    [data?.assignments?.totalCount],
  );

  const pageInfo = data?.assignments?.pageInfo;

  const handleFetchMore = useCallback(
    ({ direction }: { direction: EnumCursorDirection }) => {
      if (!validateFetchMore({ direction, pageInfo })) return;

      fetchMore({
        variables: {
          ...variables,
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          limit: ASSIGNMENT_PER_PAGE,
          direction,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            assignments: {
              ...mergeCursorData({
                direction,
                fetchMoreResult: fetchMoreResult.assignments,
                prevResult: prev.assignments,
              }),
              totalCount:
                fetchMoreResult.assignments.totalCount ??
                prev.assignments.totalCount,
            },
          };
        },
      });
    },
    [fetchMore, variables, pageInfo],
  );

  useEffect(() => {
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  return { loading, list, totalCount, handleFetchMore, pageInfo };
};
