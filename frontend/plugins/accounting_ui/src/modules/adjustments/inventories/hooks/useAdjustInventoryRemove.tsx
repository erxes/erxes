import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ADJUST_INVENTORIES_QUERY } from '../graphql/adjustInventoryQueries';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import { ADJUST_INVENTORY_REMOVE } from '../graphql/adjustInventoryRemove';
import { useNavigate } from 'react-router-dom';

export const useAdjustInventoryRemove = (
  adjustId: string,
  options?: OperationVariables,
) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const [_removeMutation, { loading }] = useMutation(
    ADJUST_INVENTORY_REMOVE,
    options,
  );

  const removeAdjust = (options?: OperationVariables) => {
    return _removeMutation({
      ...options,
      variables: {
        adjustId,
        ...options?.variables,
      },
      onError: (error: Error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('inventory-adjust-running-successfully'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: ADJUST_INVENTORIES_QUERY,
          variables: {
            ...options?.variables,
            page: 1,
            perPage: ACC_TRS__PER_PAGE,
          },
        },
      ],
      awaitRefetchQueries: true,
      update: (cache) => {
        const pathname = '/accounting/adjustment/inventory';
        navigate(pathname);
      },
    });
  };

  return {
    removeAdjust,
    loading,
  };
};
