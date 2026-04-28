import { useQuery } from '@apollo/client';
import { GET_MAIN_PRODUCT } from '@/ebarimt/settings/product-group/graphql/queries/mainProduct';

export interface IProduct {
  _id: string;
  name: string;
  type: string;
}

export const useProducts = () => {
  const { data, loading, error } = useQuery<{
    products: IProduct[];
  }>(GET_MAIN_PRODUCT, {
    variables: {
      perPage: 500,
      page: 1,
    },
  });

  const productsById = (data?.products || []).reduce<Record<string, IProduct>>(
    (acc, p) => {
      acc[p._id] = p;
      return acc;
    },
    {},
  );

  return {
    products: data?.products || [],
    productsById,
    loading,
    error,
  };
};
