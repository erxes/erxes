import { useMutation } from '@apollo/client';
import { PRODUCT_RULES_ADD } from '@/products/settings/graphql/mutations/productRules';

export const useProductRulesAdd = () => {
  const [productRulesAdd, { loading, error }] = useMutation(PRODUCT_RULES_ADD, {
    refetchQueries: ['productRules'],
  });

  return { productRulesAdd, loading, error };
};
