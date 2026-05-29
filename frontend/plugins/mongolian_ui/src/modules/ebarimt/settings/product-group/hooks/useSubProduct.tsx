import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_SUB_PRODUCT } from '@/ebarimt/settings/product-group/graphql/queries/subProduct';
import { ISubProduct } from '@/ebarimt/settings/product-group/types/subProduct';

export const useGetSubProduct = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery<{ products: ISubProduct[] }>(
    GET_SUB_PRODUCT,
    { ...options },
  );

  const subProducts = (data?.products ?? []).filter((p) => p.name);

  return { subProducts, loading, error };
};
