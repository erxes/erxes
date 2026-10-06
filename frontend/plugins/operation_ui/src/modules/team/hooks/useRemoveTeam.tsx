import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { REMOVE_TEAM } from '../graphql/mutations/removeTeam';
import { useTranslation } from 'react-i18next';
import { RemoveTeamMutation, RemoveTeamMutationVariables } from '~/gql/graphql';

export const useRemoveTeam = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [_removeTeam, { loading, error }] = useMutation(REMOVE_TEAM);
  const removeTeam = (
    options: MutationHookOptions<
      RemoveTeamMutation,
      RemoveTeamMutationVariables
    >,
  ) => {
    return _removeTeam({
      onError: (e) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      },
      ...options,
    });
  };
  return { removeTeam, loading, error };
};
