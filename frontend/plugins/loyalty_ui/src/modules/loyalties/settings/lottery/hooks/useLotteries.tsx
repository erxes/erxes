import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { QUERY_LOTTERY_CAMPAIGNS } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { LOTTERY_CURSOR_SESSION_KEY } from '../constants/lotteryCursorSessionKey';
import { ILottery } from '../types/lotteryTypes';

export const LOTTERY_PER_PAGE = 30;

export const useLottery = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: LOTTERY_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    lotteryCampaigns: {
      list: ILottery[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(QUERY_LOTTERY_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: LOTTERY_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const { list: lottery, totalCount, pageInfo } = data?.lotteryCampaigns || {};

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
          lotteryCampaigns: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.lotteryCampaigns,
              prevResult: prev.lotteryCampaigns,
            }),
            totalCount:
              fetchMoreResult.lotteryCampaigns.totalCount ??
              prev.lotteryCampaigns.totalCount,
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
