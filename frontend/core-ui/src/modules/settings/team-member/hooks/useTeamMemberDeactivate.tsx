import { useMutation } from '@apollo/client';
import { mutations } from '../graphql';

export const useTeamMemberDeactivate = () => {
  const [_deactivateTeamMembers, { loading }] = useMutation(
    mutations.USERS_DEACTIVATE_BATCH,
  );

  const deactivateTeamMembers = (teamMemberIds: string[]) =>
    _deactivateTeamMembers({
      variables: { _ids: teamMemberIds },
      refetchQueries: ['Users'],
    });

  return { deactivateTeamMembers, loading };
};
