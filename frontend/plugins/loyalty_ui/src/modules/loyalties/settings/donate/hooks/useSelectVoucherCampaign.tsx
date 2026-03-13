import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import { QUERY_VOUCHER_CAMPAIGNS } from '../../voucher/graphql';
import { IVoucherCampaign } from '../types/voucherCampaignType';

const CAMPAIGNS_PER_PAGE = 20;

export const useVoucherCampaign = (
  options?: QueryHookOptions<{
    voucherCampaigns: {
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
    voucherCampaigns: {
      list: IVoucherCampaign[];
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
      };
      totalCount: number;
    };
  }>(QUERY_VOUCHER_CAMPAIGNS, {
    ...options,
    variables: {
      limit: CAMPAIGNS_PER_PAGE,
      ...options?.variables,
    },
  });

  const campaignList = data?.voucherCampaigns?.list || [];

  const handleFetchMore = () => {
    fetchMore({
      variables: {
        limit: CAMPAIGNS_PER_PAGE,
        cursor: data?.voucherCampaigns?.pageInfo?.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          voucherCampaigns: {
            ...prev.voucherCampaigns,
            list: [
              ...prev.voucherCampaigns.list,
              ...fetchMoreResult.voucherCampaigns.list,
            ],
            pageInfo: fetchMoreResult.voucherCampaigns.pageInfo,
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
    totalCount: data?.voucherCampaigns?.totalCount || campaignList.length,
  };
};

export const useVoucherCampaignByIds = (options: OperationVariables) => {
  const { data, loading, error } = useQuery<{
    voucherCampaigns: {
      list: IVoucherCampaign[];
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
      };
      totalCount: number;
    };
  }>(QUERY_VOUCHER_CAMPAIGNS, {
    ...options,
    variables: {
      ...options?.variables,
    },
  });

  const { voucherCampaigns } = data || {};

  return {
    campaignDetail: voucherCampaigns?.list?.[0],
    loading,
    error,
  };
};
