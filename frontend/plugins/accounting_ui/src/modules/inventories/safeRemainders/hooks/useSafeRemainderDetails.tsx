import { useQuery, OperationVariables } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import { SAFE_REMAINDER_DETAILS_QUERY } from '../graphql/safeRemainderQueries';
import { ISafeRemainderItem } from '../types/SafeRemainder';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

export const useSafeRemainderDetailFilters = () => {
  const [{ searchValue, status, diffType, category }] = useMultiQueryState<{
    searchValue: string;
    status: string;
    diffType: string;
    category: string[] | string;
  }>(['searchValue', 'status', 'diffType', 'category']);

  const filters: Record<string, any> = {};
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

export const useSafeRemainderDetails = (options?: OperationVariables) => {
  const filters = useSafeRemainderDetailFilters();

  const { data, loading, error, fetchMore } = useQuery<
    {
      safeRemainderItems: ISafeRemainderItem[];
      safeRemainderItemsCount: number;
    },
    OperationVariables
  >(SAFE_REMAINDER_DETAILS_QUERY, {
    ...options,
    variables: {
      ...filters,
      ...options?.variables,
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
    },
  });
  const { safeRemainderItems = [], safeRemainderItemsCount = 0 } = data || {};

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
              ...prev.safeRemainderItems,
              ...fetchMoreResult.safeRemainderItems,
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
