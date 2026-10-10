import { useQuery } from '@apollo/client';
import { PRICING_PRODUCT_CONDITIONS } from '@/pricing/graphql/queries';

export interface IPricingProductCondition {
  _id: string;
  code: string;
  name: string;
}

export const usePricingProductConditions = () => {
  const { data, loading } = useQuery<{
    productConditions: IPricingProductCondition[];
  }>(PRICING_PRODUCT_CONDITIONS);

  return { conditions: data?.productConditions || [], loading };
};
