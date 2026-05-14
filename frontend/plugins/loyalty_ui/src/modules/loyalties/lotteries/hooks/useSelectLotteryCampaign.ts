import { useQuery } from '@apollo/client';
import { useMemo, useCallback } from 'react';
import { ILotteryCampaign } from '../types/lotteryCampaignType';
import { QUERY_LOTTERY_CAMPAIGNS } from '../../settings/lottery/add-lottery-campaign/graphql/queries/getCampaignsQuery';

const LOTTERY_CAMPAIGN_PER_PAGE = 20;

interface UseLotteryCampaignOptions {
  variables?: {
    searchValue?: string;
    status?: string;
    lotteryType?: string;
    excludeLotteryTypes?: string[];
    [key: string]: string | number | boolean | string[] | undefined;
  };
  skip?: boolean;
}

interface UseLotteryCampaignReturn {
  campaignList: ILotteryCampaign[];
  loading: boolean;
  handleFetchMore: () => void;
  totalCount: number;
}

export const useLotteryCampaign = (
  options: UseLotteryCampaignOptions = {},
): UseLotteryCampaignReturn => {
  const { variables = {}, skip } = options;

  const { data, loading, fetchMore } = useQuery(QUERY_LOTTERY_CAMPAIGNS, {
    variables: {
      limit: LOTTERY_CAMPAIGN_PER_PAGE,
      ...variables,
    },
    skip,
  });

  const campaignList = useMemo<ILotteryCampaign[]>(
    () => data?.lotteryCampaigns?.list || [],
    [data?.lotteryCampaigns?.list],
  );

  const totalCount = useMemo(
    () => data?.lotteryCampaigns?.totalCount || 0,
    [data?.lotteryCampaigns?.totalCount],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.lotteryCampaigns) return;

    fetchMore({
      variables: {
        page: Math.floor(campaignList.length / LOTTERY_CAMPAIGN_PER_PAGE) + 1,
        ...variables,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.lotteryCampaigns) {
          return prev;
        }

        return {
          lotteryCampaigns: {
            ...fetchMoreResult.lotteryCampaigns,
            list: [
              ...(prev?.lotteryCampaigns?.list || []),
              ...fetchMoreResult.lotteryCampaigns.list,
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
