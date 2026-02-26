import { SAFE_REMAINDERS_QUERY } from '../graphql/safeRemainderQueries';
import { OperationVariables, useQuery } from '@apollo/client';
import { ACC_TRS__PER_PAGE } from '../../../transactions/types/constants';

export const useSafeRemainderQueryParams = () => {
  return {
    queryParams: {
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
    },
  };
};

export const useSafeRemainders = (options?: OperationVariables) => {
  const queryParams = useSafeRemainderQueryParams();
  const { data, loading, error, fetchMore } = useQuery(SAFE_REMAINDERS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...queryParams,
    },
  });
  const { remainders, totalCount } = data?.safeRemainders || {};

  const handleFetchMore = () => {
    if (remainders?.length < totalCount) {
      fetchMore({
        variables: {
          perPage: ACC_TRS__PER_PAGE,
          page: Math.ceil(remainders?.length / ACC_TRS__PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...fetchMoreResult,
            safeRemainders: {
              ...fetchMoreResult.safeRemainders,
              remainders: [
                ...prev.safeRemainders?.remainders,
                ...fetchMoreResult.safeRemainders?.remainders,
              ],
            },
          };
        },
      });
    }
  };

  return {
    safeRemainders: remainders,
    totalCount,
    loading,
    error,
    handleFetchMore,
  };
};
