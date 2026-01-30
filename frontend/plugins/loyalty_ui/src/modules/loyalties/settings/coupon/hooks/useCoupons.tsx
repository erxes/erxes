import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { ICoupon } from '../types/couponTypes';
import { COUPONS_CURSOR_SESSION_KEY } from '../constants/couponsCursorSessionKey';
import { getCampaignsQuery } from '../graphql/queries/getCampaignsQuery';

export const COUPONS_PER_PAGE = 30;

export const useCoupons = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: COUPONS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    getCampaigns: {
      list: ICoupon[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(getCampaignsQuery, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: COUPONS_PER_PAGE,
      cursor,
      kind: 'coupon',
      ...options?.variables,
    },
  });

  const { list: coupons, totalCount, pageInfo } = data?.getCampaigns || {};

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
        limit: COUPONS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          getCampaigns: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.getCampaigns,
              prevResult: prev.getCampaigns,
            }),
            totalCount:
              fetchMoreResult.getCampaigns.totalCount ??
              prev.getCampaigns.totalCount,
          },
        };
      },
    });
  };

  return {
    loading,
    coupons,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
