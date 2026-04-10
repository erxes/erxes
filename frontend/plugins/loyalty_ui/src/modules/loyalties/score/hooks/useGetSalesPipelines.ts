import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_SALES_PIPELINES } from '../graphql/salesQueries';

interface IPipeline {
  _id: string;
  name: string;
  boardId?: string;
}

interface IResponse {
  salesPipelines: {
    list: IPipeline[];
    totalCount: number;
  };
}

interface UseGetSalesPipelinesOptions extends QueryHookOptions {
  skip?: boolean;
}

export const useGetSalesPipelines = (options?: UseGetSalesPipelinesOptions) => {
  const { data, loading, error } = useQuery<IResponse>(GET_SALES_PIPELINES, {
    errorPolicy: 'all',
    ...options,
    skip: options?.skip,
  });
  return { pipelines: data?.salesPipelines?.list || [], loading, error };
};
