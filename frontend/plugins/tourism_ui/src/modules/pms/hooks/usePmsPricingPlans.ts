import { useQuery } from '@apollo/client';

import { pmsQueries } from '@/pms/graphql/queries';

export interface IPmsPricingPlan {
  _id: string;
  name: string;
  status: string;
  type: string;
  value?: number | null;
}

export const usePmsPricingPlans = () => {
  const { data, loading, error } = useQuery<{
    pricingPlans: IPmsPricingPlan[];
  }>(pmsQueries.PmsPricingPlans, {
    variables: { status: 'active' },
    fetchPolicy: 'cache-and-network',
  });

  return {
    pricingPlans: data?.pricingPlans || [],
    loading,
    error,
  };
};
