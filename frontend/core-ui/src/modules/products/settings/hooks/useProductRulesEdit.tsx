import { useMutation } from '@apollo/client';
import { PRODUCT_RULES_EDIT } from '@/products/settings/graphql/mutations/productRules';

export const useProductRulesEdit = () => {
  const [productRulesEdit, { loading, error }] = useMutation(
    PRODUCT_RULES_EDIT,
    {
      refetchQueries: ['productRules'],
    },
  );

  return { productRulesEdit, loading, error };
};
