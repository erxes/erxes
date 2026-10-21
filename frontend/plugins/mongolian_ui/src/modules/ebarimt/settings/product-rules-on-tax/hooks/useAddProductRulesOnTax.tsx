import { OperationVariables, useMutation } from '@apollo/client';

import { PRODUCT_RULES_ROW_DEFAULT_VARIABLES } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesDefaultVariables';
import { EBARIMT_PRODUCT_RULES_ON_TAX_ADD } from '@/ebarimt/settings/product-rules-on-tax/graphql/mutations/productRulesOnTaxMutations';
import { GET_EBARIMT_PRODUCT_RULES } from '@/shared/graphql/ebarimtProductRules';

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
      update: (cache, { data }) => {
        const created = data?.ebarimtProductRuleCreate;
        if (!created) return;

        cache.updateQuery(
          {
            query: GET_EBARIMT_PRODUCT_RULES,
            variables: PRODUCT_RULES_ROW_DEFAULT_VARIABLES,
          },
          (existing) => {
            const rules = existing?.ebarimtProductRules;
            if (!rules) return existing;

            return {
              ...existing,
              ebarimtProductRules: {
                ...rules,
                list: [created, ...(rules.list ?? [])],
                totalCount: (rules.totalCount ?? 0) + 1,
              },
            };
          },
        );
      },
    });
  };

  return {
    addProductRulesOnTax,
    loading,
  };
};
