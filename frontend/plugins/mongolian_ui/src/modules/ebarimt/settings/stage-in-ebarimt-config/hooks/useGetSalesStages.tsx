import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_SALES_STAGE } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/salesStages';
import { IStage } from '@/ebarimt/settings/stage-in-ebarimt-config/types/stage';

interface IUseGetSalesStagesResponse {
  salesStages: IStage[];
}

interface UseGetSalesStagesOptions extends QueryHookOptions {
  skip?: boolean;
}

export const useGetSalesStages = (
  pipelineId?: string,
  options?: UseGetSalesStagesOptions,
) => {
  const { data, loading, error } = useQuery<IUseGetSalesStagesResponse>(
    GET_SALES_STAGE,
    {
      ...options,
      variables: {
        pipelineId: pipelineId || '',
        ...options?.variables,
      },
      skip: options?.skip || !pipelineId,
    },
  );

  return {
    stages: data?.salesStages || [],
    loading,
    error,
  };
};
