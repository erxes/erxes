import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { orpc } from '@erxes/core-contract/client';
import { categoryTree } from './categoryTree';

/** Every product category, in tree order (one request wherever it's used). */
export const useProductCategories = () => {
  const query = useQuery(orpc.productCategories.list.queryOptions({ staleTime: 60_000 }));
  const categories = useMemo(() => query.data?.data ?? [], [query.data]);
  const tree = useMemo(() => categoryTree(categories), [categories]);

  return { query, categories, tree };
};

/** Refreshes the categories, and the products, which show their category. */
const useRefresh = () => {
  const client = useQueryClient();

  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: orpc.productCategories.key() }),
      client.invalidateQueries({ queryKey: orpc.products.list.key() }),
    ]);
};

/** Callers show failures where they happen (`TAKEN`, `CATEGORY_HAS_CHILDREN`). */
export const useCategoryMutations = () => {
  const refresh = useRefresh();

  return {
    create: useMutation(orpc.productCategories.create.mutationOptions({ onSuccess: refresh })),
    update: useMutation(orpc.productCategories.update.mutationOptions({ onSuccess: refresh })),
    remove: useMutation(orpc.productCategories.remove.mutationOptions({ onSuccess: refresh })),
  };
};
