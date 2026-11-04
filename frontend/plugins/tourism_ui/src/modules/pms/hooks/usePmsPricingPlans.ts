import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { pmsQueries } from '@/pms/graphql/queries';
import type { PmsPricingPlansQuery } from '~/gql/graphql';
import { compactList } from '~/utils/cursorList';

type PricingPlanResult = NonNullable<
  NonNullable<PmsPricingPlansQuery['pricingPlans']>[number]
>;

export type IPmsPricingPlan = PricingPlanResult & { _id: string };

export const usePmsPricingPlans = () => {
  const { data, loading, error } = useQuery(pmsQueries.PmsPricingPlans, {
    variables: { status: 'active' },
    fetchPolicy: 'cache-and-network',
  });

  const list = data?.pricingPlans;
  const pricingPlans = useMemo(
    () =>
      compactList(list).flatMap((plan): IPmsPricingPlan[] =>
        plan._id ? [{ ...plan, _id: plan._id }] : [],
      ),
    [list],
  );

  return {
    pricingPlans,
    loading,
    error,
  };
};
