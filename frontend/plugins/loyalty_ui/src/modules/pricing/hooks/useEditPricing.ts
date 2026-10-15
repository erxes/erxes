import { useMutation } from '@apollo/client';
import { PRICING_PLAN_EDIT } from '@/pricing/graphql/mutations';
import type { PricingPlanEditInput } from '~/gql/graphql';

export type TPricingPlanEditDoc = PricingPlanEditInput & { _id: string };

export const useEditPricing = () => {
  const [mutate, result] = useMutation(PRICING_PLAN_EDIT, {
    refetchQueries: ['PricingPlanDetail'],
  });

  const editPricing = (doc: TPricingPlanEditDoc) =>
    mutate({
      variables: {
        doc,
      },
    });

  return {
    editPricing,
    ...result,
  };
};
