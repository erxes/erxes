import { QueryHookOptions, useQuery } from '@apollo/client';
import { IAdjustClosingDetail } from '../types/AdjustClosing';
import {
  ADJUST_CLOSING_DETAIL_QUERY,
  ADJUST_CLOSING_DETAILS,
} from '../graphql/adjustClosingDetail';
import { ACC_TRS__PER_PAGE } from '~/modules/transactions/types/constants';

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
    adjustClosingDetails: IAdjustClosingDetail[];
    adjustClosingDetailsCount: number;
  }>,
) => {
  const { data, loading, error, fetchMore } = useQuery<{
    adjustClosingDetails: IAdjustClosingDetail[];
    adjustClosingDetailsCount: number;
  }>(ADJUST_CLOSING_DETAILS, options);

  const handleFetchMore = () => {
    if (
      (data?.adjustClosingDetails?.length ?? 0) <
      (data?.adjustClosingDetailsCount ?? 0)
    ) {
      fetchMore({
        variables: {
          perPage: ACC_TRS__PER_PAGE,
          page:
            Math.ceil(
              (data?.adjustClosingDetails?.length ?? 0) / ACC_TRS__PER_PAGE,
            ) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            ...prev,
            ...fetchMoreResult,
            adjustClosingDetails: [
              ...prev.adjustClosingDetails,
              ...fetchMoreResult.adjustClosingDetails,
            ],
          };
        },
      });
    }
  };

  return {
    loading,
    adjustClosingDetails: data?.adjustClosingDetails ?? [],
    adjustClosingDetailsCount: data?.adjustClosingDetailsCount ?? 0,
    handleFetchMore,
    error,
  };
};
