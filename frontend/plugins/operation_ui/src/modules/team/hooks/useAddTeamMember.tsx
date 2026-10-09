import { MutationFunctionOptions, useMutation } from '@apollo/client';

import { ADD_TEAM_MEMBERS } from '@/team/graphql/mutations/addTeamMembers';
import { GET_TEAM_MEMBERS } from '@/team/graphql/queries/getTeamMembers';
import {
  TeamAddMembersMutation,
  TeamAddMembersMutationVariables,
} from '~/gql/graphql';

export const useAddTeamMember = () => {
  const [addTeamMember, { loading, error }] = useMutation(ADD_TEAM_MEMBERS);

  const handleAddTeamMember = (
    options: MutationFunctionOptions<
      TeamAddMembersMutation,
      TeamAddMembersMutationVariables
    >,
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
