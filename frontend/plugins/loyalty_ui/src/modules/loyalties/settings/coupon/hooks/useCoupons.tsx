import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { COUPONS_CURSOR_SESSION_KEY } from '../constants/couponsCursorSessionKey';
import { QUERY_COUPON_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { ICoupon } from '../types/couponTypes';

export const COUPONS_PER_PAGE = 30;

export const useCoupons = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: COUPONS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    couponCampaigns: {
      list: ICoupon[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(QUERY_COUPON_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: COUPONS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const { list: coupons, totalCount, pageInfo } = data?.couponCampaigns || {};

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
          couponCampaigns: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.couponCampaigns,
              prevResult: prev.couponCampaigns,
            }),
            totalCount:
              fetchMoreResult.couponCampaigns.totalCount ??
              prev.couponCampaigns.totalCount,
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
