import { useQuery, OperationVariables } from '@apollo/client';
import { SAFE_REMAINDER_DETAILS_QUERY } from '../graphql/safeRemainderQueries';
import { ISafeRemainderItem } from '../types/SafeRemainder';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

export const useSafeRemainderDetails = (options?: OperationVariables) => {
  const { data, loading, error, fetchMore } = useQuery<
    { safeRemainderDetails: ISafeRemainderItem[], safeRemainderDetailsCount: number },
    OperationVariables
  >(SAFE_REMAINDER_DETAILS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
    },
  });
  const { safeRemainderDetails = [], safeRemainderDetailsCount = 0 } = data || {};

  const handleFetchMore = () => {
    if (safeRemainderDetails?.length < safeRemainderDetailsCount) {
      fetchMore({
        variables: {
          perPage: ACC_TRS__PER_PAGE,
          page: Math.ceil(safeRemainderDetails?.length / ACC_TRS__PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...prev,
            ...fetchMoreResult,
            safeRemainderDetails: [...prev.safeRemainderDetails, ...fetchMoreResult.safeRemainderDetails],
          };
        },
      });
    }
  };

  return {
    safeRemainderDetails,
    safeRemainderDetailsCount,
    handleFetchMore,
    loading,
    error,
  };
};
