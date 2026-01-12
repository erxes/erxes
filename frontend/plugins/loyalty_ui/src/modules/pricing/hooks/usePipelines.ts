import { useQuery } from '@apollo/client';
import { GET_PIPELINES } from '@/pricing/graphql/queries';

export interface IPipeline {
  _id: string;
  name: string;
  boardId?: string;
}

interface UsePipelinesOptions {
  variables?: {
    boardId?: string;
  };
  skip?: boolean;
}

export const usePipelines = (options?: UsePipelinesOptions) => {
  const { data, loading, error } = useQuery<{
    salesPipelines: { list: IPipeline[] };
  }>(GET_PIPELINES, {
    variables: options?.variables,
    skip: options?.skip,
  });

  return { pipelines: data?.salesPipelines?.list, loading, error };
};
