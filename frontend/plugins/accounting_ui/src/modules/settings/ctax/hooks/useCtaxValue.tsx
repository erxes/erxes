import { OperationVariables, useQuery } from '@apollo/client';
import { GET_CTAX_VALUE } from '../graphql/queries/getCtaxs';
import { ICtaxRow } from '../types/CtaxRow';

export const useCtaxValue = (options?: OperationVariables) => {
  const { data, loading } = useQuery<{ ctaxRowDetail: ICtaxRow }>(GET_CTAX_VALUE, {
    ...options,
  });

  return {
    ctaxRowDetail: data?.ctaxRowDetail,
    loading,
  };
};
