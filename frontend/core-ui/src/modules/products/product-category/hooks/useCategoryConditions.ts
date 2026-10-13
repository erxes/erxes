import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PRODUCT_CATEGORY_SET_CONDITION_CODES } from '@/products/settings/graphql/mutations/productConditions';
import { ProductConditionCodesMode } from '@/products/settings/components/productsConfig/condition/types';

export const useCategoryConditions = (onDone: () => void) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const [setCodes, { loading }] = useMutation<{
    productCategorySetConditionCodes: number;
  }>(PRODUCT_CATEGORY_SET_CONDITION_CODES, {
    refetchQueries: ['ProductsMain', 'PRODUCT_DETAIL_QUERY', 'productConditions'],
  });

  const apply = (
    categoryId: string,
    code: string,
    mode: ProductConditionCodesMode,
  ) =>
    setCodes({
      variables: { categoryId, codes: [code], mode },
      onCompleted: (data) => {
        toast({
          title:
            mode === 'add'
              ? t('condition-added-to', 'Condition added to {{count}} products', {
                  count: data.productCategorySetConditionCodes,
                })
              : t(
                  'condition-removed-from',
                  'Condition removed from {{count}} products',
                  { count: data.productCategorySetConditionCodes },
                ),
        });
        onDone();
      },
      onError: (e) =>
        toast({
          title: t('error', 'Error'),
          description: e.message,
          variant: 'destructive',
        }),
    });

  return { apply, loading };
};
