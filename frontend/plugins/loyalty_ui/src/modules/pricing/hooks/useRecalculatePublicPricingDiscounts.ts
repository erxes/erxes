import { useMutation } from '@apollo/client';
import { PRICING_PLANS_RECALCULATE_PUBLIC_DISCOUNTS } from '@/pricing/graphql/mutations';

export const useRecalculatePublicPricingDiscounts = () => {
  const [mutate, result] = useMutation(
    PRICING_PLANS_RECALCULATE_PUBLIC_DISCOUNTS,
    {
      refetchQueries: ['PricingPlans'],
    },
  );

  const recalculatePublicPricingDiscounts = () => mutate();

  return {
    recalculatePublicPricingDiscounts,
    ...result,
  };
};
