import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_TEAMS } from '@/team/graphql/queries/getTeams';
import { ITeam } from '@/team/types';

interface IGetTeamsQueryResponse {
  getTeams: ITeam[];
}

export const useGetTeams = (options?: QueryHookOptions<IGetTeamsQueryResponse>) => {
  const { data, loading } =
    useQuery<IGetTeamsQueryResponse>(GET_TEAMS, options);

  const teams = data?.getTeams;

  return { teams, loading };
};
