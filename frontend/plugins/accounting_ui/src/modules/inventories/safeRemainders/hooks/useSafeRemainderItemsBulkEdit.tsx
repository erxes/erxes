import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SAFE_REMAINDER_ITEMS_BULK_EDIT } from '../graphql/safeRemainderChange';

export const useSafeRemainderItemsBulkEdit = () => {
  const { t } = useTranslation('accounting');
  const [bulkEdit, { loading }] = useMutation(SAFE_REMAINDER_ITEMS_BULK_EDIT);

  const bulkEditRemItems = (
    safeRemainderId: string,
    productsData: { productCode: string; count: number }[],
    duplicateRule: 'skip' | 'last' | 'add' = 'last',
  ) => {
    return bulkEdit({
      variables: { safeRemainderId, productsData, duplicateRule },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: `${data.safeRemainderItemsBulkEdit} item(s) updated`,
          variant: 'success',
        });
      },
      refetchQueries: ['SafeRemainderItems'],
    });
  };

  return { bulkEditRemItems, loading };
};
