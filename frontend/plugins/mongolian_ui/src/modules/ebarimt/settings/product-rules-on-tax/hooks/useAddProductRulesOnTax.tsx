import { OperationVariables, useMutation } from '@apollo/client';

import { GET_PRODUCT_RULES_ON_TAX } from '@/ebarimt/settings/product-rules-on-tax/graphql/queries/getProductRulesOnTax';
import { IProductRulesOnTax } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesOnTaxDefaultValues';
import { PRODUCT_RULES_ROW_DEFAULT_VARIABLES } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesDefaultVariables';
import { EBARIMT_PRODUCT_RULES_ON_TAX_ADD } from '@/ebarimt/settings/product-rules-on-tax/graphql/mutations/productRulesOnTaxMutations';

export const useAddProductRulesOnTax = () => {
  const [_addProductRulesOnTax, { loading }] = useMutation(
    EBARIMT_PRODUCT_RULES_ON_TAX_ADD,
    {
      refetchQueries: ['EbarimtProductRules'],
    },
  );

  const addProductRulesOnTax = (options?: OperationVariables) => {
    _addProductRulesOnTax({
      ...options,
      variables: { ...options?.variables },
      update: (cache, { data }) => {
        const existingData = cache.readQuery<{
          ebarimtProductRules: {
            list: IProductRulesOnTax[];
            totalCount: number;
          };
        }>({
          query: GET_PRODUCT_RULES_ON_TAX,
          variables: PRODUCT_RULES_ROW_DEFAULT_VARIABLES,
        });
        if (!existingData || !existingData.ebarimtProductRules) return;

        cache.writeQuery({
          query: GET_PRODUCT_RULES_ON_TAX,
          variables: PRODUCT_RULES_ROW_DEFAULT_VARIABLES,
          data: {
            ebarimtProductRules: {
              list: [
                data.ebarimtProductRuleCreate,
                ...existingData.ebarimtProductRules.list,
              ],
              totalCount: existingData.ebarimtProductRules.totalCount + 1,
            },
          },
        });
      },
    });
  };

  return {
    addProductRulesOnTax,
    loading,
  };
};
