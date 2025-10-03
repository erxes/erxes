import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { REMOVE_TEAM_MEMBER } from '@/team/graphql/mutations/removeTeamMember';
import { ITeamMember } from '@/team/types';
import { GET_TEAM_MEMBERS } from '@/team/graphql/queries/getTeamMembers';
import { useToast } from 'erxes-ui';

interface CreateTeamMutationResponse {
  removeTeamMember: ITeamMember;
}

export const useTeamMemberRemove = () => {
  const { toast } = useToast();
  const [removeTeamMember, { loading, error }] =
    useMutation<CreateTeamMutationResponse>(REMOVE_TEAM_MEMBER);

  const handleRemoveTeamMember = (
    options: MutationFunctionOptions<CreateTeamMutationResponse, any>,
  ) => {
    removeTeamMember({
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

  return { removeTeamMember: handleRemoveTeamMember, loading, error };
};
