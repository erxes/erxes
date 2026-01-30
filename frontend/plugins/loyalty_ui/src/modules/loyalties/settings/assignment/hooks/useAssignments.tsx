import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { IAssignment } from '../types/assignmentTypes';
import { ASSIGNMENTS_CURSOR_SESSION_KEY } from '../constants/assignmentsCursorSessionKey';
import { getCampaignsQuery } from '../graphql/queries/getCampaignsQuery';

export const ASSIGNMENTS_PER_PAGE = 30;

export const useAssignments = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: ASSIGNMENTS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    getCampaigns: {
      list: IAssignment[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(getCampaignsQuery, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: ASSIGNMENTS_PER_PAGE,
      cursor,
      kind: 'assignment',
      ...options?.variables,
    },
  });

  const { list: assignments, totalCount, pageInfo } = data?.getCampaigns || {};

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
          getCampaigns: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.getCampaigns,
              prevResult: prev.getCampaigns,
            }),
            totalCount:
              fetchMoreResult.getCampaigns.totalCount ??
              prev.getCampaigns.totalCount,
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
