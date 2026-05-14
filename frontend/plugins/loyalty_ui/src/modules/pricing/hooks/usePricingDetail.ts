import { useQuery } from '@apollo/client';
import { PRICING_PLAN_DETAIL } from '@/pricing/graphql/queries';
import { IPricingPlanDetail } from '@/pricing/types';

interface IPricingPlanDetailQueryResult {
  pricingPlanDetail: IPricingPlanDetail | null;
}

interface IPricingPlanDetailVariables {
  pricingPlanDetailId?: string;
}

export const usePricingDetail = (id?: string) => {
  const { data, loading, error } = useQuery<
    IPricingPlanDetailQueryResult,
    IPricingPlanDetailVariables
  >(PRICING_PLAN_DETAIL, {
    skip: !id,
    variables: id ? { pricingPlanDetailId: id } : undefined,
    fetchPolicy: 'cache-and-network',
  });

  const pricingDetail = data?.pricingPlanDetail ?? undefined;

  return {
    pricingDetail,
    loading,
    error,
  };
};
