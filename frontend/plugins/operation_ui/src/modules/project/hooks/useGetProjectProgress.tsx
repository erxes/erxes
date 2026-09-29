import { QueryHookOptions, useQuery, useSubscription } from '@apollo/client';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { IProjectProgress } from '@/project/types';
import { GET_PROJECT_PROGRESS } from '@/project/graphql/queries/getProjectProgress';

interface IGetProjectQueryResponse {
  getProjectProgress: IProjectProgress;
}

interface IGetProjectQueryVariables {
  _id: string;
}

export const useGetProjectProgress = (
  options: QueryHookOptions<
    IGetProjectQueryResponse,
    IGetProjectQueryVariables
  >,
) => {
  const { data, loading, refetch } = useQuery<
    IGetProjectQueryResponse,
    IGetProjectQueryVariables
  >(GET_PROJECT_PROGRESS, options);

  useSubscription(TASK_LIST_CHANGED, {
    variables: { filter: { projectId: options.variables?._id } },
    ignoreResults: true,
    onData: () => {
      refetch();
    },
  });

  const projectProgress = data?.getProjectProgress;

  return { projectProgress, loading, refetch };
};
