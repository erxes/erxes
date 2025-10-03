import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { ADD_TEAM } from '@/team/graphql/mutations/addTeam';
import { GET_TEAMS } from '@/team/graphql/queries/getTeams';
import { ITeam } from '@/team/types';

interface CreateTeamMutationResponse {
  teamAdd: ITeam;
}

export const useTeamCreate = () => {
  const [addTeam, { loading, error }] =
    useMutation<CreateTeamMutationResponse>(ADD_TEAM);

  const handleAddTeam = (
    options: MutationFunctionOptions<CreateTeamMutationResponse, any>,
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
