import { useQuery } from '@apollo/client';
import { useRefetchOnTaskListChange } from '@/task/hooks/useRefetchOnTaskListChange';
import { GET_PROJECT_PROGRESS } from '@/project/graphql/queries/getProjectProgress';

export const useGetProjectProgress = (projectId?: string | null) => {
  const { data, loading, refetch } = useQuery(GET_PROJECT_PROGRESS, {
    variables: projectId ? { _id: projectId } : undefined,
    skip: !projectId,
  });

  useRefetchOnTaskListChange({
    filter: { projectId },
    skip: !projectId,
    refetch,
  });

  const projectProgress = data?.getProjectProgress;

  return { projectProgress, loading, refetch };
};
