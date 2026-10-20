import { OperationVariables, useQuery } from '@apollo/client';
import { EnumCursorDirection } from 'erxes-ui';
import { PRODUCT_RULES_ROW_DEFAULT_VARIABLES } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesDefaultVariables';
import { compactList, mergeCursorList } from '@/shared/utils/cursorList';
import { GET_EBARIMT_PRODUCT_RULES } from '@/shared/graphql/ebarimtProductRules';

export const useProductRulesOnTaxRows = (options?: OperationVariables) => {
  const { data, loading, fetchMore, error } = useQuery(
    GET_EBARIMT_PRODUCT_RULES,
    {
      ...options,
      variables: {
        ...PRODUCT_RULES_ROW_DEFAULT_VARIABLES,
        ...options?.variables,
      },
    },
  );

  const productRulesOnTaxRows = compactList(data?.ebarimtProductRules?.list);
  const productRulesOnTaxRowsCount = data?.ebarimtProductRules?.totalCount || 0;
  const pageInfo = data?.ebarimtProductRules?.pageInfo;

  const handleFetchMore = () => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;

    fetchMore({
      variables: {
        cursor: pageInfo.endCursor,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!prev.ebarimtProductRules || !fetchMoreResult.ebarimtProductRules) {
          return prev;
        }
        return {
          ...prev,
          ebarimtProductRules: mergeCursorList(
            EnumCursorDirection.FORWARD,
            prev.ebarimtProductRules,
            fetchMoreResult.ebarimtProductRules,
          ),
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
