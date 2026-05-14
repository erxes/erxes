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
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const productGroupRows = useMemo(
    () => data?.ebarimtProductGroups?.list || [],
    [data?.ebarimtProductGroups?.list],
  );
  const productGroupRowsCount = data?.ebarimtProductGroups?.totalCount || 0;

  const handleFetchMore = useCallback(() => {
    if (!productGroupRows || loading) return;

    const pageInfo = data?.ebarimtProductGroups?.pageInfo;
    if (!pageInfo?.hasNextPage) return;

    fetchMore({
      variables: {
        cursor: pageInfo.endCursor,
        cursorMode: 'AFTER',
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
  }, [productGroupRows, loading, fetchMore, data]);

  return {
    productGroupRows,
    totalCount: productGroupRowsCount,
    loading,
    error,
    handleFetchMore,
  };
};
