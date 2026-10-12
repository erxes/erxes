import { useQuery } from '@apollo/client';
import { PRODUCT_CONDITIONS } from '@/products/settings/graphql/queries/getProductConditions';
import { IProductCondition } from '../components/productsConfig/condition/types';

export const useProductConditions = () => {
  const { data, loading, error } = useQuery<{
    productConditions: IProductCondition[];
  }>(PRODUCT_CONDITIONS);

  return {
    conditions: data?.productConditions || [],
    loading,
    error,
  };
};
