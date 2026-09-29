import { GET_TRIAGE } from '@/triage/graphql/queries/getTriage';
import { QueryHookOptions, useQuery } from '@apollo/client';
import type {
  OperationGetTriageQuery,
  OperationGetTriageQueryVariables,
} from '~/gql/graphql';

export const useGetTriage = (
  options: QueryHookOptions<
    OperationGetTriageQuery,
    OperationGetTriageQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_TRIAGE, options);

  return {
    triage: data?.operationGetTriage ?? undefined,
    loading,
    error,
  };
};
