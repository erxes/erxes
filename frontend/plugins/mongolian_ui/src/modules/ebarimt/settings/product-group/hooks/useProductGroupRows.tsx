import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
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
import { useMemo } from 'react';

interface IProductGroupQueryResult {
  ebarimtProductGroups: {
    list: IProductGroup[];
    totalCount: number;
    pageInfo: IRecordTableCursorPageInfo;
  };
}

export const useProductGroupRows = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: PRODUCT_GROUP_CURSOR_SESSION_KEY,
  });

  const { data, loading, fetchMore, error } =
    useQuery<IProductGroupQueryResult>(GET_PRODUCT_GROUP, {
      variables: {
        limit: PRODUCT_GROUP_ROW_PER_PAGE,
        orderBy: PRODUCT_GROUP_ORDER_BY,
        cursor,
      },
    });

  const { list, totalCount = 0, pageInfo } = data?.ebarimtProductGroups || {};

  const productGroupRows = useMemo(() => list ?? [], [list]);

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
