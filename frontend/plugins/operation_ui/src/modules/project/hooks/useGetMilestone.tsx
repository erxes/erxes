import { GET_MILESTONE } from '@/project/graphql/queries/getMilestone';
import { IMilestone } from '@/project/types';
import { QueryHookOptions, useQuery } from '@apollo/client';

interface IGetMilestoneQueryResponse {
  getMilestone: IMilestone;
}

export const useGetMilestone = (options: QueryHookOptions) => {
  const { data, loading, refetch } = useQuery<IGetMilestoneQueryResponse>(
    GET_MILESTONE,
    options,
  );

  const milestone = data?.getMilestone;

  return { milestone, loading, refetch };
};
