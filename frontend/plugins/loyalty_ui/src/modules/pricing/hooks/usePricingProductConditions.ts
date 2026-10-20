import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { compactList } from '@/loyalties/utils/cursorList';
import { PRICING_PRODUCT_CONDITIONS } from '@/pricing/graphql/queries';
import type { PricingProductConditionsQuery } from '~/gql/graphql';

export type IPricingProductCondition = NonNullable<
  NonNullable<PricingProductConditionsQuery['productConditions']>[number]
>;

export const usePricingProductConditions = () => {
  const { data, loading } = useQuery(PRICING_PRODUCT_CONDITIONS);
  const conditions = useMemo(
    () => compactList(data?.productConditions),
    [data?.productConditions],
  );

  return { conditions, loading };
};
