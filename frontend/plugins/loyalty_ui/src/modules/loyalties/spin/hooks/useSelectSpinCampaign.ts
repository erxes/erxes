import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection } from 'erxes-ui';
import { useMemo } from 'react';
import { compactList, mergeCursorList } from '@/loyalties/utils/cursorList';
import type {
  GetSpinCampaignsQuery,
  GetSpinCampaignsQueryVariables,
} from '~/gql/graphql';
import { QUERY_SPIN_CAMPAIGNS } from '../../settings/spin/add-spin-campaign/graphql/queries/getCampaignsQuery';

const SPIN_CAMPAIGN_PER_PAGE = 20;

export const useSpinCampaign = (
  options?: QueryHookOptions<
    GetSpinCampaignsQuery,
    GetSpinCampaignsQueryVariables
  >,
) => {
  const { data, loading, fetchMore } = useQuery(QUERY_SPIN_CAMPAIGNS, {
    ...options,
    variables: {
      limit: SPIN_CAMPAIGN_PER_PAGE,
      ...options?.variables,
    },
  });

  const campaignList = useMemo(
    () => compactList(data?.spinCampaigns?.list),
    [data?.spinCampaigns?.list],
  );

  const handleFetchMore = () => {
    if (!data?.spinCampaigns) return;

    fetchMore({
      variables: {
        limit: SPIN_CAMPAIGN_PER_PAGE,
        cursor: data.spinCampaigns.pageInfo?.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.spinCampaigns || !prev.spinCampaigns) {
          return prev;
        }

        return {
          ...prev,
          spinCampaigns: mergeCursorList(
            EnumCursorDirection.FORWARD,
            prev.spinCampaigns,
            fetchMoreResult.spinCampaigns,
          ),
        };
      },
    });
  };

  return {
    campaignList,
    loading,
    handleFetchMore,
    totalCount: data?.spinCampaigns?.totalCount || 0,
  };
};
