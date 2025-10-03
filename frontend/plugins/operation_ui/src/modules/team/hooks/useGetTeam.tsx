import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_TEAM } from '@/team/graphql/queries/getTeam';
import { ITeam } from '@/team/types';

interface IUseGetTeamResponse {
  getTeam: ITeam;
  loading: boolean;
  refetch: any;
}

export const useGetTeam = (options?: QueryHookOptions<IUseGetTeamResponse>) => {
  const { data, loading, refetch } = useQuery<IUseGetTeamResponse>(
    GET_TEAM,
    options,
  );

  const team = data?.getTeam;

  return { team, loading, refetch };
};
