import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { LOYALTY_SCORE_CURSOR_SESSION_KEY } from '../constants/loyaltyScoreCursorSessionKey';
import { LOYALTY_SCORE_CAMPAIGN_QUERY } from '../graphql/queries/loyaltyScoreCampaignQuery';
export const LOYALTY_SCORE_PER_PAGE = 30;

export const useLoyaltyScore = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: LOYALTY_SCORE_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    getCampaigns: {
      list: any[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(LOYALTY_SCORE_CAMPAIGN_QUERY, {
    ...options,
    variables: {
      limit: LOYALTY_SCORE_PER_PAGE,
      cursor,
      kind: 'score',
      ...options?.variables,
    },
  });

  const { list: campaigns, totalCount, pageInfo } = data?.getCampaigns || {};

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
        limit: LOYALTY_SCORE_PER_PAGE,
        direction,
        kind: 'score',
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
    campaigns,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
