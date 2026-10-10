import type {
  AccountingSafeRemainderItemsQuery,
  AccountingSafeRemainderItemsQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { useMultiQueryState } from 'erxes-ui';
import { SAFE_REMAINDER_DETAILS_QUERY } from '../graphql/safeRemainderQueries';

import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import { toSafeRemainderItem } from '../types/SafeRemainder';

export const useSafeRemainderDetailFilters = () => {
  const [{ searchValue, status, diffType, category }] = useMultiQueryState<{
    searchValue: string;
    status: string;
    diffType: string;
    category: string[] | string;
  }>(['searchValue', 'status', 'diffType', 'category']);

  const filters: Record<string, string | string[]> = {};
  if (searchValue) filters.searchValue = searchValue;
  if (status) filters.status = status;
  if (diffType) filters.diffType = diffType;
  if (category) {
    filters.productCategoryIds = Array.isArray(category)
      ? category
      : [category];
  }
  return filters;
};

export const useSafeRemainderDetails = (
  options?: QueryHookOptions<
    AccountingSafeRemainderItemsQuery,
    AccountingSafeRemainderItemsQueryVariables
  >,
) => {
  const filters = useSafeRemainderDetailFilters();

  const {
    data: queryData,
    loading,
    error,
    fetchMore,
  } = useQuery(SAFE_REMAINDER_DETAILS_QUERY, {
    ...options,
    skip: !options?.variables?.remainderId,
    variables: {
      remainderId: options?.variables?.remainderId ?? '',
      ...filters,
      ...options?.variables,
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
    },
  });
  const data = toGraphqlView(queryData);
  const safeRemainderItems = useMemo(
    () => (data?.safeRemainderItems ?? []).map(toSafeRemainderItem),
    [data?.safeRemainderItems],
  );
  const safeRemainderItemsCount = data?.safeRemainderItemsCount ?? 0;

  const handleFetchMore = () => {
    if (safeRemainderItems?.length < safeRemainderItemsCount) {
      fetchMore({
        variables: {
          ...filters,
          ...options?.variables,
          page: Math.ceil(safeRemainderItems?.length / ACC_TRS__PER_PAGE) + 1,
          perPage: ACC_TRS__PER_PAGE,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...prev,
            ...fetchMoreResult,
            safeRemainderItems: [
              ...(prev.safeRemainderItems ?? []),
              ...(fetchMoreResult.safeRemainderItems ?? []),
            ],
          };
        },
      });
    }
  };

  return {
    safeRemainderItems,
    safeRemainderItemsCount,
    handleFetchMore,
    loading,
    error,
  };
};
