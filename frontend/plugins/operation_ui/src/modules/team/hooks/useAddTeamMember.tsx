import { MutationFunctionOptions, useMutation } from '@apollo/client';

import { ADD_TEAM_MEMBERS } from '@/team/graphql/mutations/addTeamMembers';
import { GET_TEAM_MEMBERS } from '@/team/graphql/queries/getTeamMembers';
import { ITeamMember } from '@/team/types';

interface AddTeamMemberMutationResponse {
  addTeamMember: ITeamMember;
}

export const useAddTeamMember = () => {
  const [addTeamMember, { loading, error }] =
    useMutation<AddTeamMemberMutationResponse>(ADD_TEAM_MEMBERS);

  const handleAddTeamMember = (
    options: MutationFunctionOptions<AddTeamMemberMutationResponse, any>,
  ) => {
    addTeamMember({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      refetchQueries: [GET_TEAM_MEMBERS],
    });
  };

  return { addTeamMember: handleAddTeamMember, loading, error };
};
