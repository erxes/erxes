import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { compactList } from '@/loyalties/utils/cursorList';
import { GET_STAGES } from '@/pricing/graphql/queries';
import type { SalesStagesQuery } from '~/gql/graphql';

export type IStage = NonNullable<
  NonNullable<SalesStagesQuery['salesStages']>[number]
>;

interface UseSalesStagesProps {
  pipelineId?: string;
}

export const useSalesStages = ({ pipelineId }: UseSalesStagesProps) => {
  const { data, loading, error } = useQuery(GET_STAGES, {
    variables: { pipelineId },
    skip: !pipelineId,
  });
  const stages = useMemo(
    () => compactList(data?.salesStages),
    [data?.salesStages],
  );

  return { stages, loading, error };
};
