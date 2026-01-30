import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { LOTTERY_CURSOR_SESSION_KEY } from '../constants/lotteryCursorSessionKey';
import { ILottery } from '../types/lotteryTypes';
import { getCampaignsQuery } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';

export const LOTTERY_PER_PAGE = 30;

export const useLottery = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: LOTTERY_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    getCampaigns: {
      list: ILottery[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(getCampaignsQuery, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: LOTTERY_PER_PAGE,
      cursor,
      kind: 'lottery',
      ...options?.variables,
    },
  });

  const { list: lottery, totalCount, pageInfo } = data?.getCampaigns || {};

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
        limit: LOTTERY_PER_PAGE,
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
    lottery,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
