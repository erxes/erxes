import { QueryHookOptions, useQuery } from '@apollo/client';
import { QUERY_VOUCHER_CAMPAIGN } from '../../settings/voucher/graphql/queries/getCampaignQuery';

export interface IVoucherCampaignInline {
  _id: string;
  title: string;
  description?: string;
  status?: string;
}

export interface IVoucherCampaignInlineQuery {
  voucherCampaignDetail: IVoucherCampaignInline;
}

export const useVoucherCampaignInline = (
  options?: QueryHookOptions<IVoucherCampaignInlineQuery>,
) => {
  const { data, loading, error } = useQuery<IVoucherCampaignInlineQuery>(
    QUERY_VOUCHER_CAMPAIGN,
    {
      ...options,
      skip: !options?.variables?._id,
    },
  );

  return {
    campaignDetail: data?.voucherCampaignDetail,
    loading,
    error,
  };
};
