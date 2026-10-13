import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_TEAMS } from '@/team/graphql/queries/getTeams';
import { GetTeamsQuery, GetTeamsQueryVariables } from '~/gql/graphql';
import { compactList } from '@/operation/utils/cursorList';

export const useGetTeams = (
  options?: QueryHookOptions<GetTeamsQuery, GetTeamsQueryVariables>,
) => {
  const { data, loading } = useQuery(GET_TEAMS, options);

  const teams = compactList(data?.getTeams);

  return { teams, loading };
};
