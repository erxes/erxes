import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_ANOTHER_RULES_OF_PRODUCTS_ON_CITY_TAX } from '../graphql/queries/anotherRulesOfProductsOnCityTax';

export const useGetAnotherRulesOfProductsOnCityTax = (
  options?: QueryHookOptions,
) => {
  const { data, loading, error } = useQuery(
    GET_ANOTHER_RULES_OF_PRODUCTS_ON_CITY_TAX,
    {
      ...options,
      variables: {
        kind: 'vat',
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
