import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_MAIN_PRODUCT } from '@/ebarimt/settings/product-group/graphql/queries/mainProduct';
import { IMainProduct } from '@/ebarimt/settings/product-group/types/mainProduct';

export const useGetMainProduct = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery<{ products: IMainProduct[] }>(
    GET_MAIN_PRODUCT,
    { ...options },
  );

  const mainProduct = (data?.products ?? []).filter((p) => p.name);

  return { mainProduct, loading, error };
};
