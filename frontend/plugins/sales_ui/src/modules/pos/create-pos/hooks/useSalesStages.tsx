import { useQuery } from '@apollo/client';
import { GET_STAGES } from '@/deals/graphql/queries/StagesQueries';

interface Stage {
  _id: string;
  name: string;
  order?: number;
  pipelineId?: string;
  itemsTotalCount?: number;
}

interface UseSalesStagesProps {
  pipelineId?: string;
}

export const useSalesStages = ({ pipelineId }: UseSalesStagesProps) => {
  const { data, loading, error } = useQuery(GET_STAGES, {
    variables: {
      pipelineId,
    },
    skip: !pipelineId,
  });

  const stages: Stage[] = data?.salesStages || [];

  return {
    stages,
    loading,
    error,
  };
};
