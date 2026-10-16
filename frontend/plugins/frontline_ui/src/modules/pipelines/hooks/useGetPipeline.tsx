import { useQuery } from '@apollo/client';
import { GET_PIPELINE } from '@/pipelines/graphql/queries/getPipeline';

export const useGetPipeline = (_id?: string) => {
  const { data, loading, error } = useQuery(GET_PIPELINE, {
    variables: _id ? { id: _id } : undefined,
    skip: !_id,
  });

  return {
    pipeline: data?.getTicketPipeline ?? undefined,
    loading,
    error,
  };
};
