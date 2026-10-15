import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useMemo } from 'react';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/loyalties/utils/cursorList';
import type {
  GetCampaignsQuery,
  GetCampaignsQueryVariables,
} from '~/gql/graphql';
import { ASSIGNMENTS_CURSOR_SESSION_KEY } from '../constants/assignmentsCursorSessionKey';
import { QUERY_ASSIGNMENT_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';

export const ASSIGNMENTS_PER_PAGE = 30;

export const useAssignments = (
  options?: QueryHookOptions<GetCampaignsQuery, GetCampaignsQueryVariables>,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: ASSIGNMENTS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery(QUERY_ASSIGNMENT_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: ASSIGNMENTS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const assignments = useMemo(
    () => compactList(data?.assignmentCampaigns?.list),
    [data?.assignmentCampaigns?.list],
  );
  const totalCount = data?.assignmentCampaigns?.totalCount ?? 0;
  const pageInfo = toCursorPageInfo(data?.assignmentCampaigns?.pageInfo);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: ASSIGNMENTS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.assignmentCampaigns || !prev.assignmentCampaigns) {
          return prev;
        }

        return {
          ...prev,
          assignmentCampaigns: mergeCursorList(
            direction,
            prev.assignmentCampaigns,
            fetchMoreResult.assignmentCampaigns,
          ),
        };
      },
    });
  };

  return {
    loading,
    assignments,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
