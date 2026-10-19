import { QueryHookOptions, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { pmsQueries } from '@/pms/graphql/queries';
import type {
  PmsProductCategoriesQuery,
  PmsProductCategoriesQueryVariables,
} from '~/gql/graphql';
import { compactList } from '~/utils/cursorList';

export const useProductCategories = (
  options?: QueryHookOptions<
    PmsProductCategoriesQuery,
    PmsProductCategoriesQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(
    pmsQueries.ProductCategories,
    options,
  );

  const list = data?.productCategories;
  const productCategories = useMemo(
    () => (list ? compactList(list) : undefined),
    [list],
  );

  return {
    productCategories,
    loading,
    error,
  };
};
