import { useQuery, gql } from '@apollo/client';
import { queries } from '../../graphql';
import { GroupsQueryResponse } from '../types/detail';

export function useProductGroups(posId?: string) {
  const { loading, error, data, refetch } = useQuery<GroupsQueryResponse>(
    (queries.productGroups),
    {
      skip: !posId,
      fetchPolicy: "cache-and-network",
      variables: {
        posId: posId || "",
      },
      errorPolicy: "all",
      onError: (error) => {
        console.error("ProductGroups query error:", error.message);
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
    productGroups: data?.productGroups || [],
    refetch
  };
}