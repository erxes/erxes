import { useQuery } from '@apollo/client';
import { GET_SALES_STAGES } from '@/shared/graphql/salesQueries';
import { compactList } from '@/shared/utils/cursorList';

type UseGetSalesStagesOptions = {
  skip?: boolean;
};

export const useGetSalesStages = (
  pipelineId?: string,
  options?: UseGetSalesStagesOptions,
) => {
  const { data, loading, error } = useQuery(GET_SALES_STAGES, {
    variables: { pipelineId: pipelineId || '' },
    skip: options?.skip || !pipelineId,
  });

  return {
    stages: compactList(data?.salesStages),
    loading,
    error,
  };
};
