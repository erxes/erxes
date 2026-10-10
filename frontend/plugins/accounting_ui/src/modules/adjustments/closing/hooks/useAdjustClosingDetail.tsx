import type {
  AccountingAdjustClosingDetailQuery,
  AccountingAdjustClosingDetailQueryVariables,
  AccountingAdjustClosingDetailsQuery,
  AccountingAdjustClosingDetailsQueryVariables,
} from '~/gql/graphql';
import { toGraphqlView } from '@/utils/graphql';
import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  ADJUST_CLOSING_DETAIL_QUERY,
  ADJUST_CLOSING_DETAILS,
} from '../graphql/adjustClosingDetail';

export const useAdjustClosingDetail = (
  options: QueryHookOptions<
    AccountingAdjustClosingDetailQuery,
    AccountingAdjustClosingDetailQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(ADJUST_CLOSING_DETAIL_QUERY, options);
  const data = toGraphqlView(queryData);

  return {
    loading,
    adjustClosingDetail: data?.adjustClosingDetail,
    error,
  };
};

export const useAdjustClosingDetails = (
  options: QueryHookOptions<
    AccountingAdjustClosingDetailsQuery,
    AccountingAdjustClosingDetailsQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(ADJUST_CLOSING_DETAILS, options);
  const data = toGraphqlView(queryData);

  return {
    loading,
    adjustClosingDetails: data?.adjustClosingDetail?.details ?? [],
    adjustClosingDetailsCount: data?.adjustClosingEntriesCount ?? 0,
    handleFetchMore: () => null,
    error,
  };
};
