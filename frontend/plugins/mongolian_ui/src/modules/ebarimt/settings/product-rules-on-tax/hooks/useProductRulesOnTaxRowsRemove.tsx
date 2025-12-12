import { useMutation } from '@apollo/client';
import { EBARIMT_PRODUCT_RULE_ON_TAX_REMOVE } from '@/ebarimt/settings/product-rules-on-tax/graphql/mutations/productRulesOnTaxMutations';

export const useProductRulesOnTaxRemove = () => {
  const [removeProductRulesOnTax, { loading }] = useMutation(
    EBARIMT_PRODUCT_RULE_ON_TAX_REMOVE,
    {
      refetchQueries: ['EbarimtProductRules'],
    },
  );

  return {
    removeProductRulesOnTax,
    loading,
  };
};
