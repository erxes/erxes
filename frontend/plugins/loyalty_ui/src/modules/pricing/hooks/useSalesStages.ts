import { useQuery } from '@apollo/client';
import { GET_STAGES } from '@/pricing/graphql/queries';

export interface IStage {
  _id: string;
  name: string;
  order?: number;
  pipelineId?: string;
}

interface UseSalesStagesProps {
  pipelineId?: string;
}

export const useSalesStages = ({ pipelineId }: UseSalesStagesProps) => {
  const { data, loading, error } = useQuery<{ salesStages: IStage[] }>(
    GET_STAGES,
    {
      variables: { pipelineId },
      skip: !pipelineId,
    },
  );

  return { stages: data?.salesStages || [], loading, error };
};
