import { GET_TRIAGE } from '@/triage/graphql/queries/getTriage';
import { QueryHookOptions, useQuery } from '@apollo/client';
import type {
  OperationGetTriageQuery,
  OperationGetTriageQueryVariables,
} from '~/gql/graphql';

export const useGetTriage = (
  triageId: string | null | undefined,
  options?: QueryHookOptions<
    OperationGetTriageQuery,
    OperationGetTriageQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_TRIAGE, {
    ...options,
    variables: triageId ? { _id: triageId } : undefined,
    skip: !triageId || options?.skip,
  });

  return {
    triage: data?.operationGetTriage,
    loading,
    error,
  };
};
