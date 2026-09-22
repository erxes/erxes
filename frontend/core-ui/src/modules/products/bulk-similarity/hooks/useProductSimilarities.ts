import { useQuery } from '@apollo/client';
import { useRef } from 'react';
import {
  PRODUCT_SIMILARITIES,
  PRODUCT_SIMILARITIES_TOTAL_COUNT,
} from '../graphql/queries';
import { IProductSimilarity } from '../types';

const DEFAULT_PER_PAGE = 30;

export const useProductSimilarities = (variables?: {
  perPage?: number;
  searchValue?: string;
}) => {
  const perPage = variables?.perPage || DEFAULT_PER_PAGE;
  const searchValue = variables?.searchValue;

  const pageRef = useRef(1);
  const fetchingMoreRef = useRef(false);

  const { data, loading, refetch, fetchMore } = useQuery<{
    productBulkSimilarities: IProductSimilarity[];
  }>(PRODUCT_SIMILARITIES, {
    variables: { page: 1, perPage, searchValue },
  });

  const { data: totalCountData } = useQuery<{
    productBulkSimilaritiesTotalCount: number;
  }>(PRODUCT_SIMILARITIES_TOTAL_COUNT, {
    variables: { searchValue },
  });

  const similarities = data?.productBulkSimilarities || [];
  const totalCount = totalCountData?.productBulkSimilaritiesTotalCount || 0;
  const hasMore = similarities.length < totalCount;

  const handleFetchMore = () => {
    if (fetchingMoreRef.current || loading || !hasMore) return;

    fetchingMoreRef.current = true;
    const nextPage = pageRef.current + 1;

    fetchMore({
      variables: { page: nextPage, perPage, searchValue },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        pageRef.current = nextPage;
        return {
          productBulkSimilarities: [
            ...prev.productBulkSimilarities,
            ...fetchMoreResult.productBulkSimilarities,
          ],
        };
      },
    }).finally(() => {
      fetchingMoreRef.current = false;
    });
  };

  return {
    similarities,
    loading,
    totalCount,
    handleFetchMore,
    hasMore,
    refetch,
  };
};
