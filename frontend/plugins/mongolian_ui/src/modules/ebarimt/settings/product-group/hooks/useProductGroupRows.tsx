import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { GET_PRODUCT_GROUP } from '@/ebarimt/settings/product-group/graphql/queries/getProductGroup';
import { IProductGroup } from '@/ebarimt/settings/product-group/constants/productGroupDefaultValues';
import {
  PRODUCT_GROUP_CURSOR_SESSION_KEY,
  PRODUCT_GROUP_ORDER_BY,
  PRODUCT_GROUP_ROW_PER_PAGE,
} from '@/ebarimt/settings/product-group/constants/productGroupRowDefaultVariables';
import { productGroupTotalCountAtom } from '@/ebarimt/settings/product-group/states/productGroupRowStates';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';

interface IProductGroupQueryResult {
  ebarimtProductGroups: {
    list: IProductGroup[];
    totalCount: number;
    pageInfo: IRecordTableCursorPageInfo;
  };
}

export const useProductGroupRows = () => {
  const setProductGroupTotalCount = useSetAtom(productGroupTotalCountAtom);
  const { cursor } = useRecordTableCursor({
    sessionKey: PRODUCT_GROUP_CURSOR_SESSION_KEY,
  });

  const [{ searchValue, productId, status }] = useMultiQueryState<{
    searchValue: string;
    productId: string;
    status: string;
  }>(['searchValue', 'productId', 'status']);

  const { data, loading, fetchMore, error } =
    useQuery<IProductGroupQueryResult>(GET_PRODUCT_GROUP, {
      variables: {
        searchValue: searchValue || undefined,
        productId: productId || undefined,
        status: status || undefined,
        limit: PRODUCT_GROUP_ROW_PER_PAGE,
        orderBy: PRODUCT_GROUP_ORDER_BY,
        cursor,
      },
    });

  const { list, totalCount = 0, pageInfo } = data?.ebarimtProductGroups || {};

  const productGroupRows = useMemo(() => list ?? [], [list]);

  useEffect(() => {
    if (loading) {
      setProductGroupTotalCount(null);
      return;
    }
    setProductGroupTotalCount(totalCount);
  }, [loading, totalCount, setProductGroupTotalCount]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: PRODUCT_GROUP_ROW_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          ebarimtProductGroups: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.ebarimtProductGroups,
              prevResult: prev.ebarimtProductGroups,
            }),
            totalCount: fetchMoreResult.ebarimtProductGroups.totalCount,
          },
        };
      },
    });
  };

  return {
    productGroupRows,
    totalCount,
    pageInfo,
    loading,
    error,
    handleFetchMore,
  };
};
