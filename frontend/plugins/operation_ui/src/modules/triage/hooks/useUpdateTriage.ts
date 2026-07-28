import { useMutation, MutationHookOptions } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { UPDATE_TRIAGE_MUTATION } from '../graphql/mutations/updateTriage';

export const useUpdateTriage = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [updateTriageMutation, { loading, error }] = useMutation(
    UPDATE_TRIAGE_MUTATION,
  );
  const updateTriage = (options: MutationHookOptions) => {
    return updateTriageMutation({
      ...options,
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };
  return { updateTriage, loading, error };
};
