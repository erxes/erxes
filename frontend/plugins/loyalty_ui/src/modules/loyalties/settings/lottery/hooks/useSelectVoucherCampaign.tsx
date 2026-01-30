import { useQuery, QueryHookOptions, OperationVariables } from '@apollo/client';
import { IVoucherCampaign } from '../types/voucherCampaignType';
import { getCampaignsQuery } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';

const CAMPAIGNS_PER_PAGE = 20;

export const useVoucherCampaign = (
  options?: QueryHookOptions<{
    getCampaigns: {
      list: IVoucherCampaign[];
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
      };
      totalCount: number;
    };
  }>,
) => {
  const { data, loading, error, fetchMore } = useQuery<{
    getCampaigns: {
      list: IVoucherCampaign[];
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
      };
      totalCount: number;
    };
  }>(getCampaignsQuery, {
    ...options,
    variables: {
      kind: 'voucher',
      limit: CAMPAIGNS_PER_PAGE,
      ...options?.variables,
    },
  });

  const campaignList = data?.getCampaigns?.list || [];

  const handleFetchMore = () => {
    fetchMore({
      variables: {
        limit: CAMPAIGNS_PER_PAGE,
        cursor: data?.getCampaigns?.pageInfo?.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          getCampaigns: {
            ...prev.getCampaigns,
            list: [
              ...prev.getCampaigns.list,
              ...fetchMoreResult.getCampaigns.list,
            ],
            pageInfo: fetchMoreResult.getCampaigns.pageInfo,
          },
        };
      },
    });
  };

  return {
    campaignList,
    loading,
    error,
    handleFetchMore,
    totalCount: data?.getCampaigns?.totalCount || campaignList.length,
  };
};

export const useVoucherCampaignByIds = (options: OperationVariables) => {
  const { data, loading, error } = useQuery<{
    getCampaigns: {
      list: IVoucherCampaign[];
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
      };
      totalCount: number;
    };
  }>(getCampaignsQuery, {
    ...options,
    variables: {
      kind: 'voucher',
      ...options?.variables,
    },
  });

  const { getCampaigns } = data || {};

  return {
    campaignDetail: getCampaigns?.list?.[0],
    loading,
    error,
  };
};
