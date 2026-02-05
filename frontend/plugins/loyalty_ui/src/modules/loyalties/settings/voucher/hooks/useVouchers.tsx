import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { VOUCHERS_CURSOR_SESSION_KEY } from '../constants/vouchersCursorSessionKey';
import { QUERY_VOUCHER_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { IVoucher } from '../types/voucherTypes';

export const VOUCHERS_PER_PAGE = 30;

export const useVouchers = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: VOUCHERS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    voucherCampaigns: {
      list: IVoucher[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(QUERY_VOUCHER_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: VOUCHERS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const { list: vouchers, totalCount, pageInfo } = data?.voucherCampaigns || {};

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
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          voucherCampaigns: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.voucherCampaigns,
            prevResult: prev.voucherCampaigns,
          }),
        });
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
