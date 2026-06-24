import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { REMOVE_TEAM_MEMBER } from '@/team/graphql/mutations/removeTeamMember';
import { ITeamMember } from '@/team/types';
import { GET_TEAM_MEMBERS } from '@/team/graphql/queries/getTeamMembers';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface CreateTeamMutationResponse {
  removeTeamMember: ITeamMember;
}

export const useTeamMemberRemove = () => {
  const { t } = useTranslation('operation');
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

  return { removeTeamMember: handleRemoveTeamMember, loading, error };
};
