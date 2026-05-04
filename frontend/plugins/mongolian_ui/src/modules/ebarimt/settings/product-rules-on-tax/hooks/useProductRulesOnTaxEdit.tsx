import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { GET_PRODUCT_RULES_ON_TAX } from '@/ebarimt/settings/product-rules-on-tax/graphql/queries/getProductRulesOnTax';
import { EBARIMT_PRODUCT_RULE_ON_TAX_EDIT } from '@/ebarimt/settings/product-rules-on-tax/graphql/mutations/productRulesOnTaxMutations';
import { PRODUCT_RULES_ROW_DEFAULT_VARIABLES } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesDefaultVariables';

export const useProductRulesOnTaxEdit = () => {
  const [editProductRulesOnTaxRow, { loading }] = useMutation(
    EBARIMT_PRODUCT_RULE_ON_TAX_EDIT,
    {
      refetchQueries: [
        {
          query: GET_PRODUCT_RULES_ON_TAX,
          variables: PRODUCT_RULES_ROW_DEFAULT_VARIABLES,
        },
      ],
      update: (cache, { data }) => {
        if (data?.ebarimtProductRuleUpdate) {
          cache.evict({
            fieldName: 'ebarimtProductRulesOnTax',
          });
          cache.gc();

          toast({
            title: 'Success',
            description: 'Product rules on tax updated successfully',
          });
        }
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update product rules on tax',
          variant: 'destructive',
        });
      },
    },
  );

  return {
    editProductRulesOnTaxRow,
    loading,
  };
};
