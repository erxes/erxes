import { useQuery } from '@apollo/client';
import { useMemo, useCallback } from 'react';
import { ISpinCampaign } from '../types/spinCampaignType';
import { QUERY_SPIN_CAMPAIGNS } from '../../settings/spin/add-spin-campaign/graphql/queries/getCampaignsQuery';

const SPIN_CAMPAIGN_PER_PAGE = 20;

interface UseSpinCampaignOptions {
  variables?: {
    searchValue?: string;
    status?: string;
    spinType?: string;
    excludeSpinTypes?: string[];
    [key: string]: string | number | boolean | string[] | undefined;
  };
  skip?: boolean;
}

interface UseSpinCampaignReturn {
  campaignList: ISpinCampaign[];
  loading: boolean;
  handleFetchMore: () => void;
  totalCount: number;
}

export const useSpinCampaign = (
  options: UseSpinCampaignOptions = {},
): UseSpinCampaignReturn => {
  const { variables = {}, skip } = options;

  const { data, loading, fetchMore } = useQuery(QUERY_SPIN_CAMPAIGNS, {
    variables: {
      limit: SPIN_CAMPAIGN_PER_PAGE,
      ...variables,
    },
    skip,
  });

  const campaignList = useMemo<ISpinCampaign[]>(
    () => data?.spinCampaigns?.list || [],
    [data?.spinCampaigns?.list],
  );

  const totalCount = useMemo(
    () => data?.spinCampaigns?.totalCount || 0,
    [data?.spinCampaigns?.totalCount],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.spinCampaigns) return;

    fetchMore({
      variables: {
        page: Math.floor(campaignList.length / SPIN_CAMPAIGN_PER_PAGE) + 1,
        ...variables,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.spinCampaigns) {
          return prev;
        }

        return {
          spinCampaigns: {
            ...fetchMoreResult.spinCampaigns,
            list: [
              ...(prev?.spinCampaigns?.list || []),
              ...fetchMoreResult.spinCampaigns.list,
            ],
          },
        };
      },
    });
  }, [data, campaignList.length, fetchMore, variables]);

  return {
    campaignList,
    loading,
    handleFetchMore,
    totalCount,
  };
};
