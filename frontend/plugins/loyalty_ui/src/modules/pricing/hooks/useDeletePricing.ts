import { useMutation } from '@apollo/client';
import { PRICING_PLAN_REMOVE } from '@/pricing/graphql/mutations';

export const useDeletePricing = () => {
  const [mutate, result] = useMutation(PRICING_PLAN_REMOVE, {
    refetchQueries: ['PricingPlans'],
  });

  const deletePricing = (id: string) => {
    return mutate({
      variables: {
        pricingPlanRemoveId: id,
      },
    });
  };

  return {
    deletePricing,
    ...result,
  };
};
