import { OperationVariables, useQuery } from '@apollo/client';
import {
  GET_PRODUCT_RULES_ON_TAX,
  SELECT_PRODUCT_RULES_ON_TAX,
} from '@/ebarimt/settings/product-rules-on-tax/graphql/queries/getProductRulesOnTax';
import { PRODUCT_RULES_ROW_DEFAULT_VARIABLES } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesDefaultVariables';

export const useProductRulesOnTaxRows = (
  options?: OperationVariables,
  inSelect?: boolean,
) => {
  const { data, loading, fetchMore, error } = useQuery(
    inSelect ? SELECT_PRODUCT_RULES_ON_TAX : GET_PRODUCT_RULES_ON_TAX,
    {
      ...options,
      variables: {
        ...PRODUCT_RULES_ROW_DEFAULT_VARIABLES,
        ...options?.variables,
      },
    },
  );

  const productRulesOnTaxRows = data?.ebarimtProductRules?.list || [];
  const productRulesOnTaxRowsCount = data?.ebarimtProductRules?.totalCount || 0;

  const handleFetchMore = () => {
    if (!productRulesOnTaxRows.length) return;

    fetchMore({
      variables: {
        page:
          Math.ceil(
            productRulesOnTaxRows.length /
              PRODUCT_RULES_ROW_DEFAULT_VARIABLES.perPage,
          ) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.ebarimtProductRules) return prev;
        return {
          ebarimtProductRules: {
            ...prev.ebarimtProductRules,
            list: [
              ...prev.ebarimtProductRules.list,
              ...fetchMoreResult.ebarimtProductRules.list,
            ],
          },
        };
      },
    });
  };

  return {
    productRulesOnTaxRows,
    totalCount: productRulesOnTaxRowsCount,
    loading,
    error,
    handleFetchMore,
  };
};
