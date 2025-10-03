import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_TEAMS } from '@/team/graphql/queries/getTeams';
import { ITeam } from '@/team/types';
import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';

interface IGetTeamsQueryResponse {
  getTeams: ITeam[];
}

export const useGetCurrentUsersTeams = (
  options?: QueryHookOptions<IGetTeamsQueryResponse>,
) => {
  const currentUser = useAtomValue(currentUserState);
  const userId = currentUser?._id;
  const { data, loading } = useQuery<IGetTeamsQueryResponse>(GET_TEAMS, {
    ...options,
    variables: {
      userId,
      ...options?.variables,
    },
  });

  const teams = data?.getTeams;

  return { teams, loading };
};
