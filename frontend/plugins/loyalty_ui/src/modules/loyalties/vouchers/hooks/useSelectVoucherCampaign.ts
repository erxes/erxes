import { useQuery } from '@apollo/client';
import { useMemo, useCallback } from 'react';
import { QUERY_VOUCHER_CAMPAIGNS } from '../../settings/voucher/graphql/queries/getCampaignsQuery';
import { IVoucherCampaign } from '../types/voucherCampaignType';

const VOUCHER_CAMPAIGN_PER_PAGE = 20;

interface UseVoucherCampaignOptions {
  variables?: {
    searchValue?: string;
    status?: string;
    voucherType?: string;
    excludeVoucherTypes?: string[];
    [key: string]: string | number | boolean | string[] | undefined;
  };
}

interface UseVoucherCampaignReturn {
  campaignList: IVoucherCampaign[];
  loading: boolean;
  handleFetchMore: () => void;
  totalCount: number;
}

export const useVoucherCampaign = (
  options: UseVoucherCampaignOptions = {},
): UseVoucherCampaignReturn => {
  const { variables = {} } = options;

  const { data, loading, fetchMore } = useQuery(QUERY_VOUCHER_CAMPAIGNS, {
    variables: {
      perPage: VOUCHER_CAMPAIGN_PER_PAGE,
      ...variables,
    },
  });

  const campaignList = useMemo<IVoucherCampaign[]>(
    () => data?.voucherCampaigns?.list || [],
    [data?.voucherCampaigns?.list],
  );

  const totalCount = useMemo(
    () => data?.voucherCampaigns?.totalCount || 0,
    [data?.voucherCampaigns?.totalCount],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.voucherCampaigns) return;

    fetchMore({
      variables: {
        page: Math.ceil(campaignList.length / VOUCHER_CAMPAIGN_PER_PAGE) + 1,
        perPage: VOUCHER_CAMPAIGN_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.voucherCampaigns?.list) return prev;
        return {
          ...prev,
          voucherCampaigns: {
            ...fetchMoreResult.voucherCampaigns,
            list: [
              ...(prev.voucherCampaigns?.list || []),
              ...fetchMoreResult.voucherCampaigns.list,
            ],
          },
        };
      },
    });
  }, [campaignList.length, fetchMore, data?.voucherCampaigns]);

  return {
    campaignList,
    loading,
    handleFetchMore,
    totalCount,
  };
};
