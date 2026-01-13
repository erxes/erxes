import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { IVoucher } from '../types/voucherTypes';
import { VOUCHERS_CURSOR_SESSION_KEY } from '../constants/vouchersCursorSessionKey';
import { getCampaignsQuery } from '../graphql/queries/getCampaignsQuery';

export const VOUCHERS_PER_PAGE = 30;

export const useVouchers = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: VOUCHERS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    getCampaigns: {
      list: IVoucher[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(getCampaignsQuery, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: VOUCHERS_PER_PAGE,
      cursor,
      kind: 'voucher',
      ...options?.variables,
    },
  });

  const { list: vouchers, totalCount, pageInfo } = data?.getCampaigns || {};

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
          getCampaigns: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.getCampaigns,
            prevResult: prev.getCampaigns,
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
