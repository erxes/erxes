import { useQuery } from '@apollo/client';
import { PRODUCT_SIMILARITY } from '../graphql/queries';
import { IProductSimilarity } from '../types';

export const useProductSimilarity = (_id?: string) => {
  const { data, loading } = useQuery<{
    productBulkSimilarity: IProductSimilarity;
  }>(PRODUCT_SIMILARITY, { variables: { _id }, skip: !_id });

  return { similarity: data?.productBulkSimilarity, loading };
};
