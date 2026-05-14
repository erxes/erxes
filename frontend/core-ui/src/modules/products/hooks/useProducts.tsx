import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { productTotalCountAtom } from '@/products/states/productCounts';
import { productsQueries } from '@/products/graphql';
import { IProduct } from 'ui-modules';
import { PRODUCTS_CURSOR_SESSION_KEY } from '@/products/constants/productsCursorSessionKey';

export const PRODUCTS_PER_PAGE = 30;

type ProductsQueryVariables = {
  limit?: number;
  cursor?: string;
  direction?: EnumCursorDirection;

  type?: string;
  categoryIds?: string[];
  searchValue?: string;
  vendorId?: string;
  brandIds?: string[];
  tagIds?: string[];
  segment?: string;
  segmentData?: string;

  sortField?: string;
  sortDirection?: number;
};

export const useProductsVariables = (
  variables?: QueryHookOptions<any, ProductsQueryVariables>['variables'],
): ProductsQueryVariables => {
  const [
    {
      type,
      categoryIds,
      searchValue,
      vendorId,
      brandIds,
      tags,
      segment,
      segmentData,
      sortField,
      sortDirection,
    },
  ] = useMultiQueryState<{
    type: string;
    categoryIds: string[];
    searchValue: string;
    vendorId: string;
    brandIds: string[];
    tags: string[]; // stored in URL as "tags"
    segment: string;
    segmentData: string;
    sortField: string;
    sortDirection: string; // stored in URL as string (ex: "-1")
  }>([
    'type',
    'categoryIds',
    'searchValue',
    'vendorId',
    'brandIds',
    'tags',
    'segment',
    'segmentData',
    'sortField',
    'sortDirection',
  ]);

  const parsedSortDirection =
    sortDirection !== undefined &&
    sortDirection !== null &&
    sortDirection !== ''
      ? Number(sortDirection)
      : undefined;

  return {
    ...variables, // allow caller overrides first (cursor, etc.)

    // enforce paging defaults
    limit: PRODUCTS_PER_PAGE,

    // filters from URL/query-state
    type: type || undefined,
    categoryIds: categoryIds?.length ? categoryIds : undefined,
    searchValue: searchValue || undefined,
    vendorId: vendorId || undefined,
    brandIds: brandIds?.length ? brandIds : undefined,

    // URL key is "tags", GraphQL expects "tagIds"
    tagIds: tags?.length ? tags : undefined,

    segment: segment || undefined,
    segmentData: segmentData || undefined,

    // sorting defaults
    sortField: sortField || 'createdAt',
    sortDirection: parsedSortDirection ?? -1,
  };
};

export const useProducts = (options?: QueryHookOptions) => {
  const setProductTotalCount = useSetAtom(productTotalCountAtom);
  const { cursor } = useRecordTableCursor({
    sessionKey: PRODUCTS_CURSOR_SESSION_KEY,
  });

  const productsQueryVariables = useProductsVariables({
    ...(options?.variables as ProductsQueryVariables),
    cursor,
    limit: PRODUCTS_PER_PAGE,
  });

  const { data, loading, fetchMore } = useQuery<{
    productsMain: {
      list: IProduct[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(productsQueries.productsMain, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(productsQueryVariables.cursor),
    variables: productsQueryVariables,
  });

  const { list: productsMain, totalCount, pageInfo } = data?.productsMain || {};

  useEffect(() => {
    setProductTotalCount(totalCount ?? null);
  }, [totalCount, setProductTotalCount]);

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
    productsQueryVariables,
  };
};
