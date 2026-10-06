import { useMutation } from '@apollo/client';
import { RecordTable, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PRODUCTS_SET_CONDITION_GROUP } from '@/products/settings/graphql/mutations/productConditionGroups';

export const useProductsSetConditionGroup = (onDone: () => void) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const { table } = RecordTable.useRecordTable();
  const [setGroup, { loading }] = useMutation<{
    productsSetConditionGroup: number;
  }>(PRODUCTS_SET_CONDITION_GROUP, {
    refetchQueries: ['ProductsMain', 'PRODUCT_DETAIL_QUERY'],
  });

  const apply = (productIds: string[], conditionGroupId: string | null) => {
    onDone();
    setGroup({
      variables: { productIds, conditionGroupId },
      onCompleted: (data) => {
        toast({
          title: t(
            'condition-group-applied',
            'Condition group set on {{count}} products',
            { count: data.productsSetConditionGroup },
          ),
          variant: 'success',
        });
        table.setRowSelection({});
      },
      onError: (e) =>
        toast({
          title: t('error', 'Error'),
          description: e.message,
          variant: 'destructive',
        }),
    });
  };

  return { apply, loading };
};
