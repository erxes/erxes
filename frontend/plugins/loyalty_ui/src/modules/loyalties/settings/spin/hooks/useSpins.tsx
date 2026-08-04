import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { QUERY_SPIN_CAMPAIGNS } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { SPINS_CURSOR_SESSION_KEY } from '../constants/spinsCursorSessionKey';
import { ISpin } from '../types/spinTypes';

export const SPINS_PER_PAGE = 30;

export const useSpins = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: SPINS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    spinCampaigns: {
      list: ISpin[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(QUERY_SPIN_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: SPINS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const { list: spins, totalCount, pageInfo } = data?.spinCampaigns || {};

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
        limit: SPINS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          spinCampaigns: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.spinCampaigns,
            prevResult: prev.spinCampaigns,
          }),
        });
      },
    });
  };

  return {
    loading,
    spins,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
