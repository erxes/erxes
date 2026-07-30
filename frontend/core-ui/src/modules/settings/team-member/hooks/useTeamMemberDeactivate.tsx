import { useMutation } from '@apollo/client';
import { mutations } from '../graphql';

type DeactivateTeamMembersResult = {
  usersSetActiveStatusBatch: boolean;
};

type DeactivateTeamMembersVariables = {
  _ids: string[];
};

export const useTeamMemberDeactivate = () => {
  const [_deactivateTeamMembers, { loading }] = useMutation<
    DeactivateTeamMembersResult,
    DeactivateTeamMembersVariables
  >(mutations.USERS_DEACTIVATE_BATCH);

  const deactivateTeamMembers = (teamMemberIds: string[]) =>
    _deactivateTeamMembers({
      variables: { _ids: teamMemberIds },
      refetchQueries: ['Users'],
    });

  return { deactivateTeamMembers, loading };
};
