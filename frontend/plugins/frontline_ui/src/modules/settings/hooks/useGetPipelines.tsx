import { useQuery } from '@apollo/client';
import { GET_PIPELINE } from '@/settings/graphql/queries/getPipeline';

export const useGetPipelines = (_id?: string) => {
  const { data, loading, error } = useQuery(GET_PIPELINE, {
    variables: { id: _id },
    skip: !_id,
  });

  return {
    pipeline: data?.getPipeline,
    loading,
    error,
  };
};
