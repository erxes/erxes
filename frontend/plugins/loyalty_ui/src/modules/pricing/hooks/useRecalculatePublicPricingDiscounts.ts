import { useMutation } from '@apollo/client';
import { PRICING_PLANS_RECALCULATE_PUBLIC_DISCOUNTS } from '@/pricing/graphql/mutations';

interface IRecalculatePublicPricingDiscountsResult {
  pricingPlansRecalculatePublicDiscounts: Record<string, unknown>[];
}

export const useRecalculatePublicPricingDiscounts = () => {
  const [mutate, result] =
    useMutation<IRecalculatePublicPricingDiscountsResult>(
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
