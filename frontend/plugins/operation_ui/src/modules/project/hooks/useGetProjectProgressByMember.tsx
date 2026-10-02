import { useQuery, useSubscription } from '@apollo/client';
import { GET_PROJECT_PROGRESS_BY_MEMBER } from '@/project/graphql/queries/getProjectProgressByMember';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';

export const useGetProjectProgressByMember = (projectId?: string | null) => {
  const { data, loading, refetch } = useQuery(GET_PROJECT_PROGRESS_BY_MEMBER, {
    variables: projectId ? { _id: projectId } : undefined,
    skip: !projectId,
  });

  const projectProgressByMember = data?.getProjectProgressByMember;

  useSubscription(TASK_LIST_CHANGED, {
    variables: { filter: { projectId } },
    skip: !projectId,
    ignoreResults: true,
    onData: () => {
      refetch();
    },
  });

  return { projectProgressByMember, loading, refetch };
};
