import { OperationVariables, useQuery } from '@apollo/client';
import { GET_UNITS_LIST } from '../graphql';
import { useMultiQueryState } from 'erxes-ui';

export const useUnitsList = (options?: OperationVariables) => {
  const [{ searchValue }] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);
  const { data, error, loading } = useQuery(GET_UNITS_LIST, {
    variables: {
      ...options?.variables,
      searchValue,
    },
    ...options,
  });

  return {
    units: data ? data?.unitsMain?.list : [],
    totalCount: data ? data?.unitsMain?.totalCount : 0,
    error,
    loading,
  };
};
