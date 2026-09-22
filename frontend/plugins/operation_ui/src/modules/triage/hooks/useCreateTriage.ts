import { useMutation } from '@apollo/client';

import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { CREATE_TRIAGE_MUTATION } from '@/triage/graphql/mutations/createTriage';
import { GET_TRIAGES } from '@/triage/graphql/queries/getTriages';

export const useCreateTriage = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();

  const [createTriageMutation, { loading, error }] = useMutation(
    CREATE_TRIAGE_MUTATION,
    {
      refetchQueries: [GET_TRIAGES],
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('triage-created-successfully'),
          variant: 'default',
        });
      },
      onError: (e) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      },
    },
  );

  return {
    createTriage: createTriageMutation,
    loading,
    error,
  };
};
