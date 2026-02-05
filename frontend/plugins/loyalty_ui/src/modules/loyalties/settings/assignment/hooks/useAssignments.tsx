import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { ASSIGNMENTS_CURSOR_SESSION_KEY } from '../constants/assignmentsCursorSessionKey';
import { QUERY_ASSIGNMENT_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { IAssignment } from '../types/assignmentTypes';

export const ASSIGNMENTS_PER_PAGE = 30;

export const useAssignments = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: ASSIGNMENTS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    assignmentCampaigns: {
      list: IAssignment[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(QUERY_ASSIGNMENT_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: ASSIGNMENTS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const {
    list: assignments,
    totalCount,
    pageInfo,
  } = data?.assignmentCampaigns || {};

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
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          assignmentCampaigns: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.assignmentCampaigns,
              prevResult: prev.assignmentCampaigns,
            }),
            totalCount:
              fetchMoreResult.assignmentCampaigns.totalCount ??
              prev.assignmentCampaigns.totalCount,
          },
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
