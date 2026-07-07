import { useMutation } from '@apollo/client';
import { PRICING_PLAN_ADD } from '@/pricing/graphql/mutations';
import { PricingPriority } from '@/pricing/types';

interface ICreatePricingDoc {
  name: string;
  status: string;
  priority?: PricingPriority;
  applyType?: string;
  categories?: string[];
  categoriesExcluded?: string[];
  productsExcluded?: string[];
  products?: string[];
  segments?: string[];
  vendors?: string[];
  tags?: string[];
  tagsExcluded?: string[];
  customerIds?: string[];
  customerTags?: string[];
  customerExcludeTags?: string[];
  customerSegmentIds?: string[];
  companyIds?: string[];
  companyTags?: string[];
  companyExcludeTags?: string[];
  companySegmentIds?: string[];
  userIds?: string[];
  userPositions?: string[];
  userSegmentIds?: string[];
  brokerCustomerIds?: string[];
  brokerCustomerTags?: string[];
  brokerCustomerExcludeTags?: string[];
  brokerCustomerSegmentIds?: string[];
  brokerCompanyIds?: string[];
  brokerCompanyTags?: string[];
  brokerCompanyExcludeTags?: string[];
  brokerCompanySegmentIds?: string[];
  brokerUserIds?: string[];
  brokerUserPositions?: string[];
  brokerUserSegmentIds?: string[];
  productsBundle?: string[][];
  isStartDateEnabled?: boolean;
  isEndDateEnabled?: boolean;
  startDate?: string;
  endDate?: string;
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
