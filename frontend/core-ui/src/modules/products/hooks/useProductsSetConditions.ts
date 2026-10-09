import { useMutation } from '@apollo/client';
import { RecordTable, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PRODUCTS_SET_CONDITION_CODES } from '@/products/settings/graphql/mutations/productConditions';
import { ProductConditionCodesMode } from '@/products/settings/components/productsConfig/condition/types';

export const useProductsSetConditions = (onDone: () => void) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const { table } = RecordTable.useRecordTable();
  const [setCodes, { loading }] = useMutation<{
    productsSetConditionCodes: number;
  }>(PRODUCTS_SET_CONDITION_CODES, {
    refetchQueries: ['ProductsMain', 'PRODUCT_DETAIL_QUERY', 'productConditions'],
  });

  const apply = (
    productIds: string[],
    code: string,
    mode: ProductConditionCodesMode,
  ) => {
    onDone();
    setCodes({
      variables: { productIds, codes: [code], mode },
      onCompleted: (data) => {
        toast({
          title:
            mode === 'add'
              ? t('condition-added-to', 'Condition added to {{count}} products', {
                  count: data.productsSetConditionCodes,
                })
              : t(
                  'condition-removed-from',
                  'Condition removed from {{count}} products',
                  { count: data.productsSetConditionCodes },
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
