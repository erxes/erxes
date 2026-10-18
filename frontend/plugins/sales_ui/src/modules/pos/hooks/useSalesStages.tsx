import { GET_STAGES } from '@/deals/graphql/queries/StagesQueries';
import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';

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

  const stages = data?.salesStages?.filter(isDefined) || [];

  return {
    stages,
    loading,
    error,
  };
};
