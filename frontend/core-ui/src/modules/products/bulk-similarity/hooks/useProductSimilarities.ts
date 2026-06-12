import { useQuery } from '@apollo/client';
import { PRODUCT_SIMILARITIES } from '../graphql/queries';
import { IProductSimilarity } from '../types';

export const useProductSimilarities = (variables?: {
  page?: number;
  perPage?: number;
  searchValue?: string;
}) => {
  const { data, loading, refetch } = useQuery<{
    productBulkSimilarities: IProductSimilarity[];
  }>(PRODUCT_SIMILARITIES, { variables });

  return {
    similarities: data?.productBulkSimilarities || [],
    loading,
    refetch,
  };
};
