import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { UPDATE_TEAM_MEMBER } from '@/team/graphql/mutations/updateTeamMember';
import { ITeamMember } from '@/team/types';
import { GET_TEAM_MEMBERS } from '@/team/graphql/queries/getTeamMembers';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface CreateTeamMutationResponse {
  updateTeamMember: ITeamMember;
}

export const useTeamMemberUpdate = () => {
  const { t } = useTranslation('operation');
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
        toast({ title: t('success') });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },

      refetchQueries: [GET_TEAM_MEMBERS],
    });
  };

  return { updateTeamMember: handleUpdateTeamMember, loading, error };
};
