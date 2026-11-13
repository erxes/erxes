import { GET_PROJECT_PROGRESS_BY_MILESTONE } from '@/project/graphql/queries/getProjectProgressByMilestone';
import { useRefetchOnTaskListChange } from '@/task/hooks/useRefetchOnTaskListChange';
import { useQuery } from '@apollo/client';

export const useGetProjectProgressByMilestone = (projectId?: string | null) => {
  const { data, loading, refetch } = useQuery(
    GET_PROJECT_PROGRESS_BY_MILESTONE,
    {
      variables: projectId ? { projectId } : undefined,
      skip: !projectId,
    },
  );

  const projectProgressByMilestone = data?.milestoneProgress;

  useRefetchOnTaskListChange({
    filter: { projectId },
    skip: !projectId,
    refetch,
  });

  return { projectProgressByMilestone, loading, refetch };
};
