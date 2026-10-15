import { QueryHookOptions, useQuery } from '@apollo/client';
import type {
  GetVoucherCampaignQuery,
  GetVoucherCampaignQueryVariables,
} from '~/gql/graphql';
import { QUERY_VOUCHER_CAMPAIGN } from '../graphql/queries/getCampaignQuery';

export const useVoucherCampaignInline = (
  options?: QueryHookOptions<
    GetVoucherCampaignQuery,
    GetVoucherCampaignQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(QUERY_VOUCHER_CAMPAIGN, {
    ...options,
    skip: options?.skip || !options?.variables?._id,
  });

  return {
    campaignDetail: data?.voucherCampaignDetail ?? undefined,
    loading,
    error,
  };
};
