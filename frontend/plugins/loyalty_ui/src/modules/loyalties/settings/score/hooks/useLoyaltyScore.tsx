import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
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
  GetScoreCampaignsQuery,
  GetScoreCampaignsQueryVariables,
} from '~/gql/graphql';
import { LOYALTY_SCORE_CURSOR_SESSION_KEY } from '../constants/loyaltyScoreCursorSessionKey';
import { LOYALTY_SCORE_CAMPAIGN_QUERY } from '../graphql/queries/loyaltyScoreCampaignQuery';

export const LOYALTY_SCORE_PER_PAGE = 30;

export const useLoyaltyScore = (
  options?: QueryHookOptions<
    GetScoreCampaignsQuery,
    GetScoreCampaignsQueryVariables
  >,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: LOYALTY_SCORE_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery(LOYALTY_SCORE_CAMPAIGN_QUERY, {
    ...options,
    variables: {
      limit: LOYALTY_SCORE_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const campaigns = useMemo(
    () => compactList(data?.scoreCampaigns?.list),
    [data?.scoreCampaigns?.list],
  );
  const totalCount = data?.scoreCampaigns?.totalCount ?? 0;
  const pageInfo = toCursorPageInfo(data?.scoreCampaigns?.pageInfo);

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
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.scoreCampaigns || !prev.scoreCampaigns) {
          return prev;
        }

        return {
          ...prev,
          scoreCampaigns: mergeCursorList(
            direction,
            prev.scoreCampaigns,
            fetchMoreResult.scoreCampaigns,
          ),
        };
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
