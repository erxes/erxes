import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_SALES_STAGE } from '../graphql/queries/salesStages';
import { IStage } from '../types/stage';

interface IUseGetSalesStagesResponse {
  salesStages: IStage[];
}

type UseGetSalesStagesOptions = QueryHookOptions;

export const useGetSalesStages = (
  pipelineId?: string,
  options?: UseGetSalesStagesOptions,
) => {
  const { data, loading, error } = useQuery<IUseGetSalesStagesResponse>(
    GET_SALES_STAGE,
    {
      ...options,
      variables: {
        ...options?.variables,
        pipelineId: pipelineId || '',
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
