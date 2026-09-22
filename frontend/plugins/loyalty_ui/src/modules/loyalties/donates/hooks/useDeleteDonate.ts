import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { DELETE_DONATE_MUTATION } from '../graphql/mutations/mutations';

export const useDeleteDonate = () => {
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');

  const [deleteDonate, { loading, error }] = useMutation(
    DELETE_DONATE_MUTATION,
    {
      refetchQueries: ['DonatesMain'],
    },
  );

  const handleDeleteDonate = async (variables: { _ids: string[] }) => {
    return deleteDonate({
      variables,
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('donation-deleted'),
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

  return { deleteDonate: handleDeleteDonate, loading, error };
};
