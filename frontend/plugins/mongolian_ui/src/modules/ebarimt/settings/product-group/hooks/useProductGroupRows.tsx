import { OperationVariables, useQuery } from '@apollo/client';
import { GET_PRODUCT_GROUP } from '@/ebarimt/settings/product-group/graphql/queries/getProductGroup';
import { IProductGroup } from '@/ebarimt/settings/product-group/constants/productGroupDefaultValues';
import { PRODUCT_GROUP_ROW_DEFAULT_VARIABLES } from '@/ebarimt/settings/product-group/constants/productGroupRowDefaultVariables';

import { useCallback, useMemo } from 'react';

export const useProductGroupRows = (options?: OperationVariables) => {
  const { data, loading, fetchMore, error } = useQuery<{
    ebarimtProductGroups: {
      list: IProductGroup[];
      totalCount: number;
      pageInfo: any;
    };
  }>(GET_PRODUCT_GROUP, {
    ...options,
    variables: {
      ...PRODUCT_GROUP_ROW_DEFAULT_VARIABLES,
      ...options?.variables,
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  const productGroupRows = useMemo(
    () => data?.ebarimtProductGroups?.list || [],
    [data?.ebarimtProductGroups?.list],
  );
  const productGroupRowsCount = data?.ebarimtProductGroups?.totalCount || 0;

  const handleFetchMore = useCallback(() => {
    if (!productGroupRows || loading) return;

    fetchMore({
      variables: {
        page:
          Math.ceil(
            productGroupRows.length /
              PRODUCT_GROUP_ROW_DEFAULT_VARIABLES.perPage,
          ) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.ebarimtProductGroups) return prev;
        return {
          ebarimtProductGroups: {
            ...prev.ebarimtProductGroups,
            list: [
              ...prev.ebarimtProductGroups.list,
              ...fetchMoreResult.ebarimtProductGroups.list,
            ],
          },
        };
      },
    });
  }, [productGroupRows, loading, fetchMore]);

  return {
    productGroupRows,
    totalCount: productGroupRowsCount,
    loading,
    error,
    handleFetchMore,
  };
};
