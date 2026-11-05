import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'erxes-ui';
import { VAT_ROWS_REMOVE } from '../graphql/mutations/vatMutations';

export const useVatRowsRemove = () => {
  const { t } = useTranslation('accounting');
  const [removeVatRows, { loading }] = useMutation(VAT_ROWS_REMOVE, {
    refetchQueries: ['accountingVatRows'],
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    removeVatRows,
    loading,
  };
};
