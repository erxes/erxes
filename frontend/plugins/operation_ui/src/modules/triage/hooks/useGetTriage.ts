import { ITriage } from '@/triage/types/triage';
import { GET_TRIAGE } from '@/triage/graphql/queries/getTriage';
import { QueryHookOptions, useQuery } from '@apollo/client';

export const useGetTriage = (options: QueryHookOptions) => {
  const { data, loading } = useQuery<{ operationGetTriage: ITriage }>(
    GET_TRIAGE,
    { ...options },
  );

  return {
    triage: data?.operationGetTriage,
    loading,
  };
};
