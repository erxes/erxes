import { OperationVariables, useQuery } from '@apollo/client';
import { productsQueries } from '@/products/graphql';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { productCategoriesTotalCountAtom } from '../states/ProductCategory';

export const useProductCategoriesTotalCount = (options?: OperationVariables) => {
  const setTotalCount = useSetAtom(productCategoriesTotalCountAtom);

  const { data, loading } = useQuery<{ productCategoriesTotalCount: number }>(
    productsQueries.productCategoriesTotalCount,
    options,
  );

  const totalCount = data?.productCategoriesTotalCount;

  useEffect(() => {
    setTotalCount(totalCount ?? null);
  }, [totalCount, setTotalCount]);

  return { totalCount, loading };
};
