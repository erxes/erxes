import { useQuery } from '@apollo/client';
import { GET_PROJECT_PROGRESS_BY_MEMBER } from '@/project/graphql/queries/getProjectProgressByMember';
import { useRefetchOnTaskListChange } from '@/task/hooks/useRefetchOnTaskListChange';

export const useGetProjectProgressByMember = (projectId?: string | null) => {
  const { data, loading, refetch } = useQuery(GET_PROJECT_PROGRESS_BY_MEMBER, {
    variables: projectId ? { _id: projectId } : undefined,
    skip: !projectId,
  });

  const projectProgressByMember = data?.getProjectProgressByMember;

  useRefetchOnTaskListChange({
    filter: { projectId },
    skip: !projectId,
    refetch,
  });

  return { projectProgressByMember, loading, refetch };
};
