import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_ANOTHER_RULES_OF_PRODUCTS_ON_CITY_TAX } from '../graphql/queries/anotherRulesOfProductsOnCityTax';

export const useGetAnotherRulesOfProductsOnCityTax = (
  options?: QueryHookOptions,
  kind: 'vat' | 'ctax' = 'vat',
) => {
  const { data, loading, error } = useQuery(
    GET_ANOTHER_RULES_OF_PRODUCTS_ON_CITY_TAX,
    {
      ...options,
      variables: {
        ...options?.variables,
        kind,
      },
    },
  );

  const anotherRulesOfProductsOnCityTax = data?.ebarimtProductRules?.list || [];

  return {
    anotherRulesOfProductsOnCityTax,
    loading,
    error,
  };
};
