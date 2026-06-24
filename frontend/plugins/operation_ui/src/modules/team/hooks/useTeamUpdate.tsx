import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { UPDATE_TEAM } from '@/team/graphql/mutations/updateTeam';
import { ITeam } from '@/team/types';
import { GET_TEAM } from '@/team/graphql/queries/getTeam';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
interface UpdateTeamMutationResponse {
  updateTeam: ITeam;
}

export const useTeamUpdate = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [updateTeam, { loading, error }] =
    useMutation<UpdateTeamMutationResponse>(UPDATE_TEAM);

  const handleUpdateTeam = (
    options: MutationFunctionOptions<UpdateTeamMutationResponse, any>,
  ) => {
    updateTeam({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: [GET_TEAM],
    });
  };

  return { updateTeam: handleUpdateTeam, loading, error };
};
