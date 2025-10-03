import { useMutation, ApolloCache, MutationHookOptions } from '@apollo/client';
import { productsMutations } from '@/products/graphql/ProductsMutations';
import { productsQueries } from '@/products/graphql';
import { IProduct } from '@/products/types/productTypes';
import { PRODUCTS_PER_PAGE } from './useProducts';

interface ProductData {
  productsMain: {
    list: IProduct[];
    totalCount: number;
  };
}

interface AddProductResult {
  productsAdd: IProduct;
}

export function useAddProduct(
  options?: MutationHookOptions<AddProductResult, any>,
) {
  const [productsAdd, { loading, error }] = useMutation<AddProductResult>(
    productsMutations.productsAdd,
    {
      ...options,
      update: (cache: ApolloCache<any>, { data }) => {
        try {
          const queryVariables = { perPage: PRODUCTS_PER_PAGE };
          const existingData = cache.readQuery<ProductData>({
            query: productsQueries.productsMain,
            variables: queryVariables,
          });

          if (!existingData || !existingData.productsMain || !data?.productsAdd)
            return;
          cache.writeQuery<ProductData>({
            query: productsQueries.productsMain,
            variables: queryVariables,
            data: {
              productsMain: {
                ...existingData.productsMain,
                list: [...existingData.productsMain.list, data.productsAdd],
                totalCount: existingData.productsMain.totalCount + 1,
              },
            },
          });
        } catch (e) {
          console.error('error:', e);
        }
      },
    },
  );

  return { productsAdd, loading, error };
}
