import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_SALES_PIPELINES } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/salesPipelines';
import { IPipeline } from '@/ebarimt/settings/stage-in-ebarimt-config/types/pipeline';

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
