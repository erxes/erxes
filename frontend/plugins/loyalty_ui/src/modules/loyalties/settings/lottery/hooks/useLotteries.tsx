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
  LotteryCampaignsQuery,
  LotteryCampaignsQueryVariables,
} from '~/gql/graphql';
import { QUERY_LOTTERY_CAMPAIGNS } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { LOTTERY_CURSOR_SESSION_KEY } from '../constants/lotteryCursorSessionKey';

export const LOTTERY_PER_PAGE = 30;

export const useLottery = (
  options?: QueryHookOptions<
    LotteryCampaignsQuery,
    LotteryCampaignsQueryVariables
  >,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: LOTTERY_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery(QUERY_LOTTERY_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: LOTTERY_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const lottery = useMemo(
    () => compactList(data?.lotteryCampaigns?.list),
    [data?.lotteryCampaigns?.list],
  );
  const totalCount = data?.lotteryCampaigns?.totalCount ?? 0;
  const pageInfo = toCursorPageInfo(data?.lotteryCampaigns?.pageInfo);

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
        if (!fetchMoreResult.lotteryCampaigns || !prev.lotteryCampaigns) {
          return prev;
        }

        return {
          ...prev,
          lotteryCampaigns: mergeCursorList(
            direction,
            prev.lotteryCampaigns,
            fetchMoreResult.lotteryCampaigns,
          ),
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
