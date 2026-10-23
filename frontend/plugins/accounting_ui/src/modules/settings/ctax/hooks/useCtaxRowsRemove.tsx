import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'erxes-ui';
import { CTAX_ROWS_REMOVE } from '../graphql/mutations/ctaxMutations';

export const useCtaxRowsRemove = () => {
  const { t } = useTranslation('accounting');
  const [removeCtaxRows, { loading }] = useMutation(CTAX_ROWS_REMOVE, {
    refetchQueries: ['accountingCtaxRows'],
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    removeCtaxRows,
    loading,
  };
};
