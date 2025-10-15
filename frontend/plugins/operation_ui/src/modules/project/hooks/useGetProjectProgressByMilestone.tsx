import { GET_PROJECT_PROGRESS_BY_MILESTONE } from '@/project/graphql/queries/getProjectProgressByMilestone';
import { IMilestone, IMilestoneProgress } from '@/project/types';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';

interface IGetMilestoneProgressQueryResponse {
  milestoneProgress: Array<IMilestone & IMilestoneProgress>;
}

export const useGetProjectProgressByMilestone = (options: QueryHookOptions) => {
  const { data, loading, refetch, subscribeToMore } =
    useQuery<IGetMilestoneProgressQueryResponse>(
      GET_PROJECT_PROGRESS_BY_MILESTONE,
      options,
    );

  const projectProgressByMilestone =
    data?.milestoneProgress || ([] as Array<IMilestone & IMilestoneProgress>);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: TASK_LIST_CHANGED,
      variables: { projectId: options.variables?.projectId },
      updateQuery: () => {
        refetch();
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options.variables?._id, subscribeToMore, refetch]);

  return { projectProgressByMilestone, loading, refetch };
};
