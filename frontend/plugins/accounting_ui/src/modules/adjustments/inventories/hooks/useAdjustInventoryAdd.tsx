import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { ADJUST_INVENTORY_ADD } from '../graphql/adjustInventoryAdd';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ADJUST_INVENTORIES_QUERY } from '../graphql/adjustInventoryQueries';

export const useAdjustInventoryAdd = (
  options?: GraphqlMutationOptions<typeof ADJUST_INVENTORY_ADD>,
) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();

  const [_addAdjustInventory, { loading }] = useMutation(
    ADJUST_INVENTORY_ADD,
    options,
  );

  const addAdjustInventory = (
    options?: GraphqlMutationOptions<typeof ADJUST_INVENTORY_ADD>,
  ) => {
    return _addAdjustInventory({
      ...options,
      onError: (error: ApolloError) => {
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
          description: t('adjust-inventory-created-successfully'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: ADJUST_INVENTORIES_QUERY,
          variables: {
            page: 1,
            perPage: 20,
          },
        },
      ],
      awaitRefetchQueries: true,
      update: (_cache, { data }) => {
        const newId = data?.adjustInventoryAdd?._id;

        const pathname = newId
          ? `/accounting/adjustment/inventory/edit?id=${newId}`
          : '/accounting/adjustment/inventory';

        navigate(pathname);
      },
    });
  };

  return {
    addAdjustInventory,
    loading,
  };
};
