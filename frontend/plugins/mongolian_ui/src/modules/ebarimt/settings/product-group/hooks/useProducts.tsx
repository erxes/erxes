import { useQuery } from '@apollo/client';
import { GET_PRODUCT_GROUP } from '@/ebarimt/settings/product-group/graphql/queries/getProductGroup';

export interface IProduct {
  _id: string;
  name: string;
  code: string;
  type: string;
  category?: {
    _id: string;
    name: string;
  };
}

export const useProducts = (searchValue?: string) => {
  const { data, loading, error } = useQuery<{
    products: IProduct[];
  }>(GET_PRODUCT_GROUP, {
    variables: {
      searchValue,
      perPage: 100,
    },
  });

  return {
    products: data?.products || [],
    loading,
    error,
  };
};
