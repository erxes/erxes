import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { UPDATE_TEAM_MEMBER } from '@/team/graphql/mutations/updateTeamMember';
import { ITeamMember } from '@/team/types';
import { GET_TEAM_MEMBERS } from '@/team/graphql/queries/getTeamMembers';
import { useToast } from 'erxes-ui';

interface CreateTeamMutationResponse {
  updateTeamMember: ITeamMember;
}

export const useTeamMemberUpdate = () => {
  const { toast } = useToast();
  const [updateTeamMember, { loading, error }] =
    useMutation<CreateTeamMutationResponse>(UPDATE_TEAM_MEMBER);

  const handleUpdateTeamMember = (
    options: MutationFunctionOptions<CreateTeamMutationResponse, any>,
  ) => {
    updateTeamMember({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
        toast({ title: 'Success!' });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },

      refetchQueries: [GET_TEAM_MEMBERS],
    });
  };

  return { updateTeamMember: handleUpdateTeamMember, loading, error };
};
