import { useQuery } from '@apollo/client';
import { GET_RESPONSE } from '@/responseTemplate/graphql/queries/getResponse';

export const useGetResponse = (_id?: string) => {
  const { data, loading, error } = useQuery(GET_RESPONSE, {
    variables: _id ? { id: _id } : undefined,
    skip: !_id,
  });

  return {
    response: data?.responseTemplate ?? undefined,
    loading,
    error,
  };
};
