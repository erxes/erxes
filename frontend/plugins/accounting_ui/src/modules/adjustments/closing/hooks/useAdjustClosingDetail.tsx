import { QueryHookOptions, useQuery } from '@apollo/client';
import { IAdjustClosingDetail } from '../types/AdjustClosing';
import { ADJUST_CLOSING_DETAIL_QUERY } from '../graphql/adjustClosingDetail';

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
