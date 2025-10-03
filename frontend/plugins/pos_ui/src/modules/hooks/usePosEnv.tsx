import { useQuery, gql } from '@apollo/client';
import { queries } from '../graphql';

interface PosEnvQueryResponse {
  posEnv: any;
}

export function usePosEnv() {
  const { loading, error, data, refetch } = useQuery<PosEnvQueryResponse>(
    (queries.posEnv),
    {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
      onError: (error) => {
        console.error("PosEnv query error:", error.message);
      }
    }
  );

  const permissionError = error?.graphQLErrors?.some(
    e => e.message === "Permission required" || e.extensions?.code === "INTERNAL_SERVER_ERROR"
  );

  return {
    loading,
    error,
    permissionError,
    posEnv: data?.posEnv,
    refetch
  };
}