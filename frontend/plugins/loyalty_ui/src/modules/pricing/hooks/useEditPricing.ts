import { useMutation } from '@apollo/client';
import { useCallback } from 'react';
import { PRICING_PLAN_EDIT } from '@/pricing/graphql/mutations';
import { IPricingPlanDetail } from '@/pricing/types';

interface IEditPricingVariables {
  doc: Partial<IPricingPlanDetail> & { _id: string };
}

interface IEditPricingResult {
  pricingPlanEdit: {
    _id: string;
  };
}

export const useEditPricing = () => {
  const [mutate, result] = useMutation<
    IEditPricingResult,
    IEditPricingVariables
  >(PRICING_PLAN_EDIT, {
    refetchQueries: ['PricingPlanDetail'],
  });

  const editPricing = useCallback(
    (doc: IEditPricingVariables['doc']) =>
      mutate({
        variables: {
          doc,
        },
      }),
    [mutate],
  );

  return {
    editPricing,
    ...result,
  };
};
