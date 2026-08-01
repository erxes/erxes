import { useQuery } from '@apollo/client';
import { GET_PUBLIC_API_OPERATIONS } from '../graphql/queries/getPublicApiOperations';
import type { IPublicApiOperation } from '../types';

type PublicApiOperationsData = {
  publicApiOperations: IPublicApiOperation[];
};

export const usePublicApiOperations = () => {
  const { data, loading, error } = useQuery<PublicApiOperationsData>(
    GET_PUBLIC_API_OPERATIONS,
  );

  return {
    operations: data?.publicApiOperations || [],
    loading,
    error,
  };
};
