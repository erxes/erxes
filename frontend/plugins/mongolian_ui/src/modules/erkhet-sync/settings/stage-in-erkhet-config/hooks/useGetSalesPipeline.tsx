import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_SALES_PIPELINES } from '../graphql/queries/salesPipelines';
import { IPipeline } from '../types/pipeline';

interface IUseGetSalesPipelinesResponse {
  salesPipelines: {
    list: IPipeline[];
    totalCount: number;
    pageInfo: any;
  };
}

interface UseGetSalesPipelinesOptions extends QueryHookOptions {
  skip?: boolean;
}

export const useGetSalesPipelines = (options?: UseGetSalesPipelinesOptions) => {
  const { data, loading, error } = useQuery<IUseGetSalesPipelinesResponse>(
    GET_SALES_PIPELINES,
    {
      ...options,
      skip: options?.skip,
    },
  );

  return {
    pipelines: data?.salesPipelines?.list || [],
    loading,
    error,
  };
};
