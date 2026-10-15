import { useQuery } from '@apollo/client';
import { PRICING_PLAN_DETAIL } from '@/pricing/graphql/queries';

export const usePricingDetail = (id?: string) => {
  const { data, loading, error } = useQuery(PRICING_PLAN_DETAIL, {
    skip: !id,
    variables: { pricingPlanDetailId: id || '' },
    fetchPolicy: 'cache-and-network',
  });

  const pricingDetail = data?.pricingPlanDetail ?? undefined;

  return {
    pricingDetail,
    loading,
    error,
  };
};
