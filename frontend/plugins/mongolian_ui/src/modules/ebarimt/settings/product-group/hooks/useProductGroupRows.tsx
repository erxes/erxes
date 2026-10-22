import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { GET_PRODUCT_GROUP } from '@/ebarimt/settings/product-group/graphql/queries/getProductGroup';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/shared/utils/cursorList';
import {
  PRODUCT_GROUP_CURSOR_SESSION_KEY,
  PRODUCT_GROUP_ORDER_BY,
  PRODUCT_GROUP_ROW_PER_PAGE,
} from '@/ebarimt/settings/product-group/constants/productGroupRowDefaultVariables';
import { productGroupTotalCountAtom } from '@/ebarimt/settings/product-group/states/productGroupRowStates';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';

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

  const { data, loading, fetchMore, error } = useQuery(GET_PRODUCT_GROUP, {
    variables: {
      searchValue: searchValue || undefined,
      productId: productId || undefined,
      status: status || undefined,
      limit: PRODUCT_GROUP_ROW_PER_PAGE,
      orderBy: PRODUCT_GROUP_ORDER_BY,
      cursor,
    },
  });

  const list = data?.ebarimtProductGroups?.list;
  const totalCount = data?.ebarimtProductGroups?.totalCount ?? 0;
  const pageInfo = toCursorPageInfo(data?.ebarimtProductGroups?.pageInfo);

  const productGroupRows = useMemo(() => compactList(list), [list]);

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
        if (
          !fetchMoreResult.ebarimtProductGroups ||
          !prev.ebarimtProductGroups
        ) {
          return prev;
        }
        return {
          ...prev,
          ebarimtProductGroups: mergeCursorList(
            direction,
            prev.ebarimtProductGroups,
            fetchMoreResult.ebarimtProductGroups,
          ),
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
