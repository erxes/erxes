import { useQuery } from '@apollo/client';
import { PRICING_PRODUCT_CONDITION_GROUPS } from '@/pricing/graphql/queries';

export interface IPricingConditionGroup {
  _id: string;
  name: string;
  conditions: { _id: string; name: string }[];
}

export const usePricingConditionGroups = () => {
  const { data, loading } = useQuery<{
    productConditionGroups: IPricingConditionGroup[];
  }>(PRICING_PRODUCT_CONDITION_GROUPS);

  return { conditionGroups: data?.productConditionGroups || [], loading };
};
