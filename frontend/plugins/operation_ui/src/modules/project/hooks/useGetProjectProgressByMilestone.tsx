import { GET_PROJECT_PROGRESS_BY_MILESTONE } from '@/project/graphql/queries/getProjectProgressByMilestone';
import { IMilestone, IMilestoneProgress } from '@/project/types';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { QueryHookOptions, useQuery, useSubscription } from '@apollo/client';

interface IGetMilestoneProgressQueryResponse {
  milestoneProgress: Array<IMilestone & IMilestoneProgress>;
}

export const useGetProjectProgressByMilestone = (options: QueryHookOptions) => {
  const { data, loading, refetch } =
    useQuery<IGetMilestoneProgressQueryResponse>(
      GET_PROJECT_PROGRESS_BY_MILESTONE,
      options,
    );

  const projectProgressByMilestone =
    data?.milestoneProgress || ([] as Array<IMilestone & IMilestoneProgress>);

  useSubscription(TASK_LIST_CHANGED, {
    variables: { filter: { projectId: options.variables?.projectId } },
    ignoreResults: true,
    onData: () => {
      refetch();
    },
  });

  return { projectProgressByMilestone, loading, refetch };
};
