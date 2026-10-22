import { useQuery } from '@apollo/client';
import { GET_SALES_PIPELINES } from '@/shared/graphql/salesQueries';
import { compactList } from '@/shared/utils/cursorList';

type UseGetSalesPipelinesOptions = {
  variables?: { boardId?: string };
  skip?: boolean;
};

export const useGetSalesPipelines = (options?: UseGetSalesPipelinesOptions) => {
  const { data, loading, error } = useQuery(GET_SALES_PIPELINES, {
    variables: options?.variables,
    skip: options?.skip,
  });

  return {
    pipelines: compactList(data?.salesPipelines?.list),
    loading,
    error,
  };
};
