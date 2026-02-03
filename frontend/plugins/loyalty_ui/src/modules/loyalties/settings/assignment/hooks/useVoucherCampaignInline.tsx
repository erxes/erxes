import { QueryHookOptions, useQuery } from '@apollo/client';
import { QUERY_VOUCHER_CAMPAIGNS } from '../../voucher/graphql';

export interface IVoucherCampaignInline {
  _id: string;
  title: string;
  description?: string;
  status?: string;
}

export interface IVoucherCampaignInlineQuery {
  voucherCampaigns: { list: IVoucherCampaignInline[] };
}

export const useVoucherCampaignInline = (
  options?: QueryHookOptions<IVoucherCampaignInlineQuery>,
) => {
  const { data, loading, error } = useQuery<IVoucherCampaignInlineQuery>(
    QUERY_VOUCHER_CAMPAIGNS,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
    },
  );

  return {
    campaignDetail: data?.voucherCampaigns?.list?.[0],
    loading,
    error,
  };
};
