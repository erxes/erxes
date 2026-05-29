import { useQuery } from '@apollo/client';
import { IRecordTableCursorPageInfo } from 'erxes-ui';
import { GET_PRODUCT_GROUP } from '@/ebarimt/settings/product-group/graphql/queries/getProductGroup';
import { IProductGroup } from '@/ebarimt/settings/product-group/constants/productGroupDefaultValues';
import { PRODUCT_GROUP_ROW_DEFAULT_VARIABLES } from '@/ebarimt/settings/product-group/constants/productGroupRowDefaultVariables';
import { useCallback, useMemo } from 'react';

interface IProductGroupQueryResult {
  ebarimtProductGroups: {
    list: IProductGroup[];
    totalCount: number;
    pageInfo: IRecordTableCursorPageInfo;
  };
}

export const useProductGroupRows = () => {
  const { data, loading, fetchMore, error } = useQuery<IProductGroupQueryResult>(
    GET_PRODUCT_GROUP,
    {
      variables: PRODUCT_GROUP_ROW_DEFAULT_VARIABLES,
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
    },
  );

  const productGroupRows = useMemo(
    () => data?.ebarimtProductGroups?.list ?? [],
    [data?.ebarimtProductGroups?.list],
  );

  const totalCount = data?.ebarimtProductGroups?.totalCount ?? 0;
  const pageInfo = data?.ebarimtProductGroups?.pageInfo;
  const hasNextPage = pageInfo?.hasNextPage ?? false;

  const handleFetchMore = useCallback(() => {
    if (loading || !hasNextPage || !pageInfo?.endCursor) return;

    fetchMore({
      variables: {
        cursor: pageInfo.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.ebarimtProductGroups) return prev;
        return {
          ebarimtProductGroups: {
            ...fetchMoreResult.ebarimtProductGroups,
            list: [
              ...prev.ebarimtProductGroups.list,
              ...fetchMoreResult.ebarimtProductGroups.list,
            ],
          },
        };
      },
    });
  }, [loading, hasNextPage, pageInfo?.endCursor, fetchMore]);

  return {
    productGroupRows,
    totalCount,
    hasNextPage,
    loading,
    error,
    handleFetchMore,
  };
};
