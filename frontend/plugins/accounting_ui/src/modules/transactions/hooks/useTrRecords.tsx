import { TR_RECORDS_QUERY } from '../graphql/transactionQueries';
import { OperationVariables, useQuery } from '@apollo/client';
import { ACC_TRS__PER_PAGE } from '../types/constants';

export const useTrRecords = (options?: OperationVariables) => {
  const { data, loading, error, fetchMore } = useQuery(
    TR_RECORDS_QUERY,
    {
      ...options,
      variables: {
        ...options?.variables,
        page: 1,
        perPage: ACC_TRS__PER_PAGE,
      },
    }
  );
  const { accTrRecords, accTrRecordsCount } = data || {};

  const handleFetchMore = () => {
    if (accTrRecords?.length < accTrRecordsCount) {
      fetchMore({
        variables: {
          perPage: ACC_TRS__PER_PAGE,
          page: Math.ceil(accTrRecords?.length / ACC_TRS__PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...prev,
            ...fetchMoreResult,
            accTrRecords: [...prev.accTrRecords, ...fetchMoreResult.accTrRecords],
          };
        },
      });
    }
  };

  return {
    trRecords: data?.accTrRecords,
    totalCount: data?.accTrRecordsCount,
    loading,
    error,
    handleFetchMore,
  };
};
