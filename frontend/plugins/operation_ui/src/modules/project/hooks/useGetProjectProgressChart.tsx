import { useQuery } from '@apollo/client';
import { GET_PROJECT_PROGRESS_CHART } from '@/project/graphql/queries/getProjectProgressChart';
import { useRefetchOnTaskListChange } from '@/task/hooks/useRefetchOnTaskListChange';

export const useGetProjectProgressChart = (projectId?: string | null) => {
  const { data, loading, refetch } = useQuery(GET_PROJECT_PROGRESS_CHART, {
    variables: projectId ? { _id: projectId } : undefined,
    skip: !projectId,
  });

  useRefetchOnTaskListChange({
    filter: { projectId },
    skip: !projectId,
    refetch,
  });

  const getProjectProgressChart = data?.getProjectProgressChart;

  return { getProjectProgressChart, loading, refetch };
};
