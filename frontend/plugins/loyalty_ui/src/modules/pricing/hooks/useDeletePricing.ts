import { useMutation } from '@apollo/client';
import { PRICING_PLAN_REMOVE } from '@/pricing/graphql/mutations';

interface IDeletePricingVariables {
  pricingPlanRemoveId: string;
}

interface IDeletePricingResult {
  pricingPlanRemove: {
    _id: string;
  };
}

export const useDeletePricing = () => {
  const [mutate, result] = useMutation<
    IDeletePricingResult,
    IDeletePricingVariables
  >(PRICING_PLAN_REMOVE, {
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
