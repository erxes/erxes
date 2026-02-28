import { useQuery, OperationVariables } from '@apollo/client';
import { SAFE_REMAINDER_DETAILS_QUERY } from '../graphql/safeRemainderQueries';
import { ISafeRemainderItem } from '../types/SafeRemainder';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

export const useSafeRemainderDetails = (options?: OperationVariables) => {
  const { data, loading, error, fetchMore } = useQuery<
    {
      safeRemainderItems: ISafeRemainderItem[];
      safeRemainderItemsCount: number;
    },
    OperationVariables
  >(SAFE_REMAINDER_DETAILS_QUERY, {
    ...options,
    variables: {
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
