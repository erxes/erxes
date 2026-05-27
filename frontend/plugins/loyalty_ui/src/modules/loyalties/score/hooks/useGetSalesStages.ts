import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_SALES_STAGES } from '../graphql/salesQueries';

interface IStage {
  _id: string;
  name: string;
  order?: number;
  pipelineId?: string;
}

interface IResponse {
  salesStages: IStage[];
}

interface UseGetSalesStagesOptions extends QueryHookOptions {
  skip?: boolean;
}

export const useGetSalesStages = (
  pipelineId?: string,
  options?: UseGetSalesStagesOptions,
) => {
  const { data, loading, error } = useQuery<IResponse>(GET_SALES_STAGES, {
    errorPolicy: 'all',
    ...options,
    variables: { pipelineId: pipelineId || '', ...options?.variables },
    skip: options?.skip || !pipelineId,
  });
  return { stages: data?.salesStages || [], loading, error };
};
