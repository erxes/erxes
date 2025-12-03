'use client';
import { QueryHookOptions, useQuery } from '@apollo/client';

import { GET_PRODUCTS } from '../graphql/queries/ProductQueries';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { IProduct } from 'ui-modules';
import { PRODUCTS_CURSOR_SESSION_KEY } from '../constant/productsCursorSessionKey';

export const PRODUCTS_PER_PAGE = 30;

export const useProducts = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: PRODUCTS_CURSOR_SESSION_KEY,
  });
  console.log('aaa');
  const { data, loading, fetchMore } = useQuery<{
    productsMain: {
      list: IProduct[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(GET_PRODUCTS, {
    ...options,
    variables: {
      limit: PRODUCTS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });
  console.log('hereee', data);
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
  console.log('kkkk', productsMain);
  return {
    loading,
    productsMain,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
