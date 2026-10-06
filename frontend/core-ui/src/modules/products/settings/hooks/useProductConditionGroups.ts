import { useQuery } from '@apollo/client';
import { PRODUCT_CONDITION_GROUPS } from '@/products/settings/graphql/queries/getProductConditionGroups';
import { IProductConditionGroup } from '../components/productsConfig/conditionGroup/types';

export const useProductConditionGroups = () => {
  const { data, loading, error } = useQuery<{
    productConditionGroups: IProductConditionGroup[];
  }>(PRODUCT_CONDITION_GROUPS);

  return {
    conditionGroups: data?.productConditionGroups || [],
    loading,
    error,
  };
};
