import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_PROJECT_PROGRESS_BY_TEAM } from '@/project/graphql/queries/getProjectProgressByTeam';
import { IProjectProgressByTeam } from '@/project/types';

interface IGetProjectQueryResponse {
  getProjectProgressByTeam: IProjectProgressByTeam[];
}

export const useGetProjectProgressByTeam = (options: QueryHookOptions) => {
  const { data, loading, refetch } = useQuery<IGetProjectQueryResponse>(
    GET_PROJECT_PROGRESS_BY_TEAM,
    options,
  );

  const projectProgressByTeam = data?.getProjectProgressByTeam;

  return { projectProgressByTeam, loading, refetch };
};
