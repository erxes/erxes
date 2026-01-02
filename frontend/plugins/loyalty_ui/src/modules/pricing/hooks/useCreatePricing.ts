import { useMutation } from '@apollo/client';
import { PRICING_PLAN_ADD } from '@/pricing/graphql/mutations';

interface ICreatePricingDoc {
  name: string;
  status: string;
  type?: string;
  value?: number;
  priceAdjustType?: string;
  priceAdjustFactor?: number;
  bonusProduct?: string;
  applyType?: string;
  categories?: string[];
  categoriesExcluded?: string[];
  productsExcluded?: string[];
  products?: string[];
  segments?: string[];
  vendors?: string[];
  tags?: string[];
  tagsExcluded?: string[];
  productsBundle?: string[][];
}

interface ICreatePricingVariables {
  doc: ICreatePricingDoc;
}

interface ICreatePricingResult {
  pricingPlanAdd: {
    _id: string;
  };
}

export const useCreatePricing = () => {
  const [mutate, result] = useMutation<
    ICreatePricingResult,
    ICreatePricingVariables
  >(PRICING_PLAN_ADD, {
    refetchQueries: ['PricingPlans'],
  });

  const createPricing = (doc: ICreatePricingDoc) => {
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
