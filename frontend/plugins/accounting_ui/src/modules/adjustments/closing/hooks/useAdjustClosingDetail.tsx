import { QueryHookOptions, useQuery } from '@apollo/client';
import { IAdjustClosingDetail } from '../types/AdjustClosing';
import {
  ADJUST_CLOSING_DETAIL_QUERY,
  ADJUST_CLOSING_DETAILS,
} from '../graphql/adjustClosingDetail';

export const useAdjustClosingDetail = (
  options: QueryHookOptions<{ adjustClosingDetail: IAdjustClosingDetail }>,
) => {
  const { data, loading, error } = useQuery<{
    adjustClosingDetail: IAdjustClosingDetail;
  }>(ADJUST_CLOSING_DETAIL_QUERY, options);

  return {
    loading,
    adjustClosingDetail: data?.adjustClosingDetail,
    error,
  };
};

export const useAdjustClosingDetails = (
  options: QueryHookOptions<{
    adjustClosingDetail: IAdjustClosingDetail;
    adjustClosingDetailsCount: number;
  }>,
) => {
  const { data, loading, error } = useQuery<{
    adjustClosingDetail: IAdjustClosingDetail;
    adjustClosingDetailsCount: number;
  }>(ADJUST_CLOSING_DETAILS, options);

  return {
    loading,
    adjustClosingDetails: data?.adjustClosingDetail?.details ?? [],
    adjustClosingDetailsCount: data?.adjustClosingDetailsCount ?? 0,
    handleFetchMore: () => null,
    error,
  };
};
