import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'erxes-ui';
import { CTAX_ROWS_EDIT } from '../graphql/mutations/ctaxMutations';

export const useCtaxRowEdit = () => {
  const { t } = useTranslation('accounting');
  const [editCtaxRow, { loading }] = useMutation(CTAX_ROWS_EDIT, {
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
    editCtaxRow,
    loading,
  };
};
