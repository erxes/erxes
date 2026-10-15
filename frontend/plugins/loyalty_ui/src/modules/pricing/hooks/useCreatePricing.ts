import { useMutation } from '@apollo/client';
import { PRICING_PLAN_ADD } from '@/pricing/graphql/mutations';
import type { PricingPlanAddInput } from '~/gql/graphql';

export const useCreatePricing = () => {
  const [mutate, result] = useMutation(PRICING_PLAN_ADD, {
    refetchQueries: ['PricingPlans'],
  });

  const createPricing = (doc: PricingPlanAddInput) => {
    return mutate({
      variables: {
        doc,
      },
    });
  };

  return {
    createPricing,
    ...result,
  };
};
