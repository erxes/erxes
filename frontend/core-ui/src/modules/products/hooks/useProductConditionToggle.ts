import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PRODUCTS_SET_CONDITION_CODES } from '@/products/settings/graphql/mutations/productConditions';

// One product, one code at a time; the cell stays open for the next pick.
export const useProductConditionToggle = (
  productId: string,
  conditionCodes: string[],
) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const [setCodes, { loading }] = useMutation(PRODUCTS_SET_CONDITION_CODES, {
    refetchQueries: ['productConditions'],
  });

  const toggle = (code: string) => {
    const selected = conditionCodes.includes(code);
    const nextCodes = selected
      ? conditionCodes.filter((current) => current !== code)
      : [...conditionCodes, code];

    setCodes({
      variables: {
        productIds: [productId],
        codes: [code],
        mode: selected ? 'remove' : 'add',
      },
      optimisticResponse: { productsSetConditionCodes: 1 },
      update: (cache) => {
        cache.modify({
          id: cache.identify({ __typename: 'Product', _id: productId }),
          fields: { conditionCodes: () => nextCodes },
        });
      },
      onError: (e) =>
        toast({
          title: t('error', 'Error'),
          description: e.message,
          variant: 'destructive',
        }),
    });
  };

  return { toggle, loading };
};
