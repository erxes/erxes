import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { SpinsEditMutationVariables } from '~/gql/graphql';
import { SPINS_EDIT_MUTATION } from '../graphql/mutations/mutations';

export const useEditSpin = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [editSpin, { loading, error }] = useMutation(SPINS_EDIT_MUTATION, {
    refetchQueries: ['SpinsMain'],
  });

  const spinEdit = async (variables: SpinsEditMutationVariables) => {
    return editSpin({
      variables,
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('spin-updated'),
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { spinEdit, loading, error };
};
