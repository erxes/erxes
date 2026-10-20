import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection } from 'erxes-ui';
import { useMemo } from 'react';
import { compactList, mergeCursorList } from '@/loyalties/utils/cursorList';
import type {
  VoucherCampaignsQuery,
  VoucherCampaignsQueryVariables,
} from '~/gql/graphql';
import { QUERY_VOUCHER_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';

const CAMPAIGNS_PER_PAGE = 20;

export const useVoucherCampaign = (
  options?: QueryHookOptions<
    VoucherCampaignsQuery,
    VoucherCampaignsQueryVariables
  >,
) => {
  const { data, loading, error, fetchMore } = useQuery(
    QUERY_VOUCHER_CAMPAIGNS,
    {
      ...options,
      variables: {
        limit: CAMPAIGNS_PER_PAGE,
        ...options?.variables,
      },
    },
  );

  const campaignList = useMemo(
    () => compactList(data?.voucherCampaigns?.list),
    [data?.voucherCampaigns?.list],
  );

  const handleFetchMore = () => {
    fetchMore({
      variables: {
        limit: CAMPAIGNS_PER_PAGE,
        cursor: data?.voucherCampaigns?.pageInfo?.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.voucherCampaigns || !prev.voucherCampaigns) {
          return prev;
        }

        return {
          ...prev,
          voucherCampaigns: mergeCursorList(
            EnumCursorDirection.FORWARD,
            prev.voucherCampaigns,
            fetchMoreResult.voucherCampaigns,
          ),
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
