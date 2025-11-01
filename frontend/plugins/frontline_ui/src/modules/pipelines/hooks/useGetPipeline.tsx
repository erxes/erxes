import { useQuery } from '@apollo/client';
import { GET_PIPELINE } from '@/pipelines/graphql/queries/getPipeline';
import { IPipeline } from '@/pipelines/types';

interface IUseGetPipelineResponse {
  getTicketPipeline: IPipeline;
}

export const useGetPipeline = (_id?: string) => {
  const { data, loading, error } = useQuery<IUseGetPipelineResponse>(
    GET_PIPELINE,
    {
      variables: { id: _id },
      skip: !_id,
    },
  );

  return {
    pipeline: data?.getTicketPipeline,
    loading,
    error,
  };
};
