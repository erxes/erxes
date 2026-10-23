import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'erxes-ui';
import { VAT_ROWS_EDIT } from '../graphql/mutations/vatMutations';

export const useVatRowEdit = () => {
  const { t } = useTranslation('accounting');
  const [editVatRow, { loading }] = useMutation(VAT_ROWS_EDIT, {
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
    editVatRow,
    loading,
  };
};
