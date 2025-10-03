import { QueryHookOptions, useQuery } from '@apollo/client';

import { productsQueries } from '@/products/graphql';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { IProduct } from 'ui-modules';
import { PRODUCTS_CURSOR_SESSION_KEY } from '@/products/constants/productsCursorSessionKey';
export const PRODUCTS_PER_PAGE = 30;

export const useProducts = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: PRODUCTS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    productsMain: {
      list: IProduct[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(productsQueries.productsMain, {
    ...options,
    variables: {
      limit: PRODUCTS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const { list: productsMain, totalCount, pageInfo } = data?.productsMain || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: PRODUCTS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          productsMain: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.productsMain,
            prevResult: prev.productsMain,
          }),
        });
      },
    });
  };

  return {
    loading,
    productsMain,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
