import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection } from 'erxes-ui';
import { useMemo } from 'react';
import { compactList, mergeCursorList } from '@/loyalties/utils/cursorList';
import type {
  LotteryCampaignsQuery,
  LotteryCampaignsQueryVariables,
} from '~/gql/graphql';
import { QUERY_LOTTERY_CAMPAIGNS } from '../../settings/lottery/add-lottery-campaign/graphql/queries/getCampaignsQuery';

const LOTTERY_CAMPAIGN_PER_PAGE = 20;

export const useLotteryCampaign = (
  options?: QueryHookOptions<
    LotteryCampaignsQuery,
    LotteryCampaignsQueryVariables
  >,
) => {
  const { data, loading, fetchMore } = useQuery(QUERY_LOTTERY_CAMPAIGNS, {
    ...options,
    variables: {
      limit: LOTTERY_CAMPAIGN_PER_PAGE,
      ...options?.variables,
    },
  });

  const campaignList = useMemo(
    () => compactList(data?.lotteryCampaigns?.list),
    [data?.lotteryCampaigns?.list],
  );

  const handleFetchMore = () => {
    if (!data?.lotteryCampaigns) return;

    fetchMore({
      variables: {
        limit: LOTTERY_CAMPAIGN_PER_PAGE,
        cursor: data.lotteryCampaigns.pageInfo?.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.lotteryCampaigns || !prev.lotteryCampaigns) {
          return prev;
        }

        return {
          ...prev,
          lotteryCampaigns: mergeCursorList(
            EnumCursorDirection.FORWARD,
            prev.lotteryCampaigns,
            fetchMoreResult.lotteryCampaigns,
          ),
        };
      },
    });
  };

  return {
    campaignList,
    loading,
    handleFetchMore,
    totalCount: data?.lotteryCampaigns?.totalCount || 0,
  };
};
