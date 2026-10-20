import { OperationVariables, useMutation } from '@apollo/client';

import { EBARIMT_PRODUCT_RULES_ON_TAX_ADD } from '@/ebarimt/settings/product-rules-on-tax/graphql/mutations/productRulesOnTaxMutations';

export const useAddProductRulesOnTax = () => {
  const [_addProductRulesOnTax, { loading }] = useMutation(
    EBARIMT_PRODUCT_RULES_ON_TAX_ADD,
    {
      refetchQueries: ['mongolianEbarimtProductRules'],
    },
  );

  const addProductRulesOnTax = (options?: OperationVariables) => {
    _addProductRulesOnTax({
      ...options,
      variables: { ...options?.variables },
    });
  };

  return {
    addProductRulesOnTax,
    loading,
  };
};
