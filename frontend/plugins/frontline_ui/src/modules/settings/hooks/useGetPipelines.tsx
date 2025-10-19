import { useQuery } from '@apollo/client';
import { GET_PIPELINE } from '@/settings/graphql/queries/getPipeline';

export const useGetPipelines = (id?: string) => {
  const { data, loading, error } = useQuery(GET_PIPELINE, {
    variables: { id },
    skip: !id,
  });

  return {
    pipeline: data?.getPipeline,
    loading,
    error,
  };
};
