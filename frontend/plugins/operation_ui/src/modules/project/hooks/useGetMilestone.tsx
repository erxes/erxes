import { GET_MILESTONE } from '@/project/graphql/queries/getMilestone';
import { QueryHookOptions, useQuery } from '@apollo/client';
import type {
  GetMilestoneQuery,
  GetMilestoneQueryVariables,
} from '~/gql/graphql';

export const useGetMilestone = (
  milestoneId?: string | null,
  options?: Omit<
    QueryHookOptions<GetMilestoneQuery, GetMilestoneQueryVariables>,
    'variables'
  >,
) => {
  const { data, loading, refetch } = useQuery(GET_MILESTONE, {
    ...options,
    variables: milestoneId ? { _id: milestoneId } : undefined,
    skip: !milestoneId || options?.skip,
  });

  const milestone = data?.getMilestone;

  return { milestone, loading, refetch };
};
