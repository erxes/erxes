import { useQuery } from '@apollo/client';
import { GET_PROJECT_PROGRESS_BY_TEAM } from '@/project/graphql/queries/getProjectProgressByTeam';

export const useGetProjectProgressByTeam = (projectId?: string | null) => {
  const { data, loading, refetch } = useQuery(GET_PROJECT_PROGRESS_BY_TEAM, {
    variables: projectId ? { _id: projectId } : undefined,
    skip: !projectId,
  });

  const projectProgressByTeam = data?.getProjectProgressByTeam;

  return { projectProgressByTeam, loading, refetch };
};
