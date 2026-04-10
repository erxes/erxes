import { useQuery } from '@apollo/client';
import { useMemo, useCallback, useEffect } from 'react';
import {
  useMultiQueryState,
  useRecordTableCursor,
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { parseDateRangeFromString } from 'erxes-ui/modules/filter/date-filter/utils/parseDateRangeFromString';
import { useSetAtom } from 'jotai';
import { couponTotalCountAtom } from '../states/useCouponCounts';
import { COUPONS_QUERY } from '../graphql/queries/queries';
import { ICoupon } from '../types/coupon';

const COUPON_PER_PAGE = 30;
const COUPON_CURSOR_SESSION_KEY = 'coupons_cursor';

interface UseCouponListOptions {
  [key: string]: string | number | boolean | string[] | undefined;
}

export const useCouponVariables = (options: UseCouponListOptions = {}) => {
  const [{ couponStatus, couponCampaignId, ownerType, couponDate, orderType, sortField: sortFieldQuery }] =
    useMultiQueryState<{
      couponStatus: string;
      couponCampaignId: string;
      ownerType: string;
      couponDate: string;
      orderType: string;
      sortField: string;
    }>(['couponStatus', 'couponCampaignId', 'ownerType', 'couponDate', 'orderType', 'sortField']);

  const dateRange = parseDateRangeFromString(couponDate);

  const sortField = sortFieldQuery || (orderType ? 'createdAt' : undefined);
  let sortDirection: number | undefined;
  if (orderType === 'ascending') sortDirection = 1;
  else if (orderType === 'descending') sortDirection = -1;

  return {
    limit: COUPON_PER_PAGE,
    status: couponStatus || undefined,
    campaignId: couponCampaignId || undefined,
    ownerType: ownerType || undefined,
    fromDate: dateRange?.from?.toISOString() || undefined,
    toDate: dateRange?.to?.toISOString() || undefined,
    sortField,
    sortDirection,
    ...options,
  };
};

export const useCouponList = (options: UseCouponListOptions = {}) => {
  const variables = useCouponVariables(options);
  const setTotalCount = useSetAtom(couponTotalCountAtom);

  const { cursor } = useRecordTableCursor({
    sessionKey: COUPON_CURSOR_SESSION_KEY,
  });

  const { data, loading, fetchMore } = useQuery(COUPONS_QUERY, {
    variables: { ...variables, cursor },
    notifyOnNetworkStatusChange: true,
  });

  const couponList = useMemo<ICoupon[]>(
    () => data?.coupons?.list || [],
    [data?.coupons?.list],
  );

  const totalCount = useMemo(
    () => data?.coupons?.totalCount || 0,
    [data?.coupons?.totalCount],
  );

  const pageInfo = data?.coupons?.pageInfo;

  const handleFetchMore = useCallback(
    ({ direction }: { direction: EnumCursorDirection }) => {
      if (!validateFetchMore({ direction, pageInfo })) return;

      fetchMore({
        variables: {
          ...variables,
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          limit: COUPON_PER_PAGE,
          direction,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            coupons: {
              ...mergeCursorData({
                direction,
                fetchMoreResult: fetchMoreResult.coupons,
                prevResult: prev.coupons,
              }),
              totalCount:
                fetchMoreResult.coupons.totalCount ?? prev.coupons.totalCount,
            },
          };
        },
      });
    },
    [fetchMore, variables, pageInfo],
  );

  useEffect(() => {
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  return { loading, couponList, totalCount, handleFetchMore, pageInfo };
};
