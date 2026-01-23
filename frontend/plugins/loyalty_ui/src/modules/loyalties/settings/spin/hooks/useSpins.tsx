import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { ISpin } from '../types/spinTypes';
import { SPINS_CURSOR_SESSION_KEY } from '../constants/spinsCursorSessionKey';
import { getCampaignsQuery } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';

export const SPINS_PER_PAGE = 30;

export const useSpins = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: SPINS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    getCampaigns: {
      list: ISpin[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(getCampaignsQuery, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: SPINS_PER_PAGE,
      cursor,
      kind: 'spin',
      ...options?.variables,
    },
  });

  const { list: spins, totalCount, pageInfo } = data?.getCampaigns || {};

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
          getCampaigns: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.getCampaigns,
            prevResult: prev.getCampaigns,
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
