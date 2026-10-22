import { useQuery, QueryHookOptions } from '@apollo/client';
import { compactList } from '@/shared/utils/cursorList';
import type {
  MongolianEbarimtProductRulesQuery,
  MongolianEbarimtProductRulesQueryVariables,
} from '~/gql/graphql';
import { IAnotherRulesOfProductsOnCityTax } from '../types/anotherRulesOfProductsOnCityTax';
import { GET_EBARIMT_PRODUCT_RULES } from '@/shared/graphql/ebarimtProductRules';

export const useGetAnotherRulesOfProductsOnCityTax = (
  options?: QueryHookOptions<
    MongolianEbarimtProductRulesQuery,
    MongolianEbarimtProductRulesQueryVariables
  >,
  kind: 'vat' | 'ctax' = 'vat',
) => {
  const { data, loading, error } = useQuery(GET_EBARIMT_PRODUCT_RULES, {
    ...options,
    variables: {
      ...options?.variables,
      kind,
    },
  });

  const anotherRulesOfProductsOnCityTax: IAnotherRulesOfProductsOnCityTax[] =
    compactList(data?.ebarimtProductRules?.list).flatMap((rule) =>
      rule._id ? [{ _id: rule._id, title: rule.title ?? '' }] : [],
    );

  return {
    anotherRulesOfProductsOnCityTax,
    loading,
    error,
  };
};
