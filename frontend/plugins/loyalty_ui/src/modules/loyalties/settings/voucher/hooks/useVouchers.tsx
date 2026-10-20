import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useMemo } from 'react';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/loyalties/utils/cursorList';
import type {
  VoucherCampaignsQuery,
  VoucherCampaignsQueryVariables,
} from '~/gql/graphql';
import { VOUCHERS_CURSOR_SESSION_KEY } from '../constants/vouchersCursorSessionKey';
import { QUERY_VOUCHER_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';

export const VOUCHERS_PER_PAGE = 30;

export const useVouchers = (
  options?: QueryHookOptions<
    VoucherCampaignsQuery,
    VoucherCampaignsQueryVariables
  >,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: VOUCHERS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery(QUERY_VOUCHER_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: VOUCHERS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const vouchers = useMemo(
    () => compactList(data?.voucherCampaigns?.list),
    [data?.voucherCampaigns?.list],
  );
  const totalCount = data?.voucherCampaigns?.totalCount ?? 0;
  const pageInfo = toCursorPageInfo(data?.voucherCampaigns?.pageInfo);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: VOUCHERS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.voucherCampaigns || !prev.voucherCampaigns) {
          return prev;
        }

        return {
          ...prev,
          voucherCampaigns: mergeCursorList(
            direction,
            prev.voucherCampaigns,
            fetchMoreResult.voucherCampaigns,
          ),
        };
      },
    });
  };

  return {
    loading,
    vouchers,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
