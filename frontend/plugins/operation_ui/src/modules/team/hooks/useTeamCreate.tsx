import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { ADD_TEAM } from '@/team/graphql/mutations/addTeam';
import { GET_TEAMS } from '@/team/graphql/queries/getTeams';
import { TeamAddMutation, TeamAddMutationVariables } from '~/gql/graphql';

export const useTeamCreate = () => {
  const [addTeam, { loading, error }] = useMutation(ADD_TEAM);

  const handleAddTeam = (
    options: MutationFunctionOptions<TeamAddMutation, TeamAddMutationVariables>,
  ) => {
    addTeam({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      refetchQueries: [GET_TEAMS],
    });
  };

  return { addTeam: handleAddTeam, loading, error };
};
