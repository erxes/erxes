import { QueryHookOptions, useQuery } from '@apollo/client';
import { getCampaignsQuery } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';

export interface IVoucherCampaignInline {
  _id: string;
  name: string;
  description?: string;
  status?: string;
  kind?: string;
}

export interface IVoucherCampaignInlineQuery {
  getCampaigns: { list: IVoucherCampaignInline[] };
}

export const useVoucherCampaignInline = (
  options?: QueryHookOptions<IVoucherCampaignInlineQuery>,
) => {
  const { data, loading, error } = useQuery<IVoucherCampaignInlineQuery>(
    getCampaignsQuery,
    {
      ...options,
      variables: {
        kind: 'voucher',
        ...options?.variables,
      },
    },
  );

  return {
    campaignDetail: data?.getCampaigns?.list?.[0],
    loading,
    error,
  };
};
