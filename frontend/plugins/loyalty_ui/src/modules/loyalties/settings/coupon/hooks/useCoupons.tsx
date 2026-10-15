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
  GetCouponCampaignsQuery,
  GetCouponCampaignsQueryVariables,
} from '~/gql/graphql';
import { QUERY_COUPON_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { COUPONS_CURSOR_SESSION_KEY } from '../constants/couponsCursorSessionKey';

export const COUPONS_PER_PAGE = 30;

export const useCoupons = (
  options?: QueryHookOptions<
    GetCouponCampaignsQuery,
    GetCouponCampaignsQueryVariables
  >,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: COUPONS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery(QUERY_COUPON_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: COUPONS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const coupons = useMemo(
    () => compactList(data?.couponCampaigns?.list),
    [data?.couponCampaigns?.list],
  );
  const totalCount = data?.couponCampaigns?.totalCount ?? 0;
  const pageInfo = toCursorPageInfo(data?.couponCampaigns?.pageInfo);

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
        if (!fetchMoreResult.couponCampaigns || !prev.couponCampaigns) {
          return prev;
        }

        return {
          ...prev,
          couponCampaigns: mergeCursorList(
            direction,
            prev.couponCampaigns,
            fetchMoreResult.couponCampaigns,
          ),
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
