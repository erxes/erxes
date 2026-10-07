import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_TEAMS } from '@/team/graphql/queries/getTeams';
import { GetTeamsQuery, GetTeamsQueryVariables } from '~/gql/graphql';
import { compactList } from '@/operation/utils/cursorList';
import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';

export const useGetCurrentUsersTeams = (
  options?: QueryHookOptions<GetTeamsQuery, GetTeamsQueryVariables>,
) => {
  const currentUser = useAtomValue(currentUserState);
  const userId = currentUser?._id;
  const { data, loading } = useQuery(GET_TEAMS, {
    ...options,
    variables: {
      userId,
      ...options?.variables,
    },
  });

  const teams = compactList(data?.getTeams);

  return { teams, loading };
};
