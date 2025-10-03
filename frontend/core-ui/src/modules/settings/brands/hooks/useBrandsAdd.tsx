import { ApolloCache, MutationHookOptions, useMutation } from '@apollo/client';
import { ADD_BRANDS, GET_BRANDS } from '../graphql';
import { IBrandData, TAddBrandResult } from '../types';
import { useBrandsVariables } from './useBrands';
export function useBrandsAdd(
  options?: MutationHookOptions<TAddBrandResult, any>,
) {
  const variables = useBrandsVariables(options);
  const [brandsAdd, { loading, error }] = useMutation(ADD_BRANDS, {
    ...options,
    update: (cache: ApolloCache<any>, { data }) => {
      if (!data?.brandsAdd) return;

      cache.updateQuery<IBrandData>(
        { query: GET_BRANDS, variables },
        (existingData) => {
          if (!existingData || !existingData.brands.list) return existingData;

          return {
            brands: {
              ...existingData.brands,
              list: [data.brandsAdd, ...existingData.brands.list],
              totalCount: existingData.brands.totalCount + 1,
            },
          };
        },
      );
    },
  });

  return {
    brandsAdd,
    loading,
    error,
  };
}
