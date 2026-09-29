import { QueryHookOptions, useQuery, useSubscription } from '@apollo/client';
import { GET_PROJECT_PROGRESS_BY_MEMBER } from '@/project/graphql/queries/getProjectProgressByMember';
import { IProjectProgressByMember } from '@/project/types';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';

interface IGetProjectQueryResponse {
  getProjectProgressByMember: IProjectProgressByMember[];
}

export const useGetProjectProgressByMember = (options: QueryHookOptions) => {
  const { data, loading, refetch } = useQuery<IGetProjectQueryResponse>(
    GET_PROJECT_PROGRESS_BY_MEMBER,
    options,
  );

  const projectProgressByMember =
    data?.getProjectProgressByMember || ([] as IProjectProgressByMember[]);

  useSubscription(TASK_LIST_CHANGED, {
    variables: { filter: { projectId: options.variables?._id } },
    ignoreResults: true,
    onData: () => {
      refetch();
    },
  });

  return { projectProgressByMember, loading, refetch };
};
