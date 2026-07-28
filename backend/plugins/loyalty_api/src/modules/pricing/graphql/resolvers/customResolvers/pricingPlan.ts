import { IContext } from '~/connectionResolvers';
import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import { getProductIdsForPlan } from '@/pricing/utils/product';

const PricingPlan = {
  createdBy(pricingPlan: IPricingPlanDocument) {
    return pricingPlan.createdBy ?? null;
  },

  updatedBy(pricingPlan: IPricingPlanDocument) {
    return pricingPlan.updatedBy ?? null;
  },

  createdUser(pricingPlan: IPricingPlanDocument) {
    if (!pricingPlan.createdBy) return null;

    return {
      __typename: 'User',
      _id: pricingPlan.createdBy,
    };
  },

  updatedUser(pricingPlan: IPricingPlanDocument) {
    if (!pricingPlan.updatedBy) return null;

    return {
      __typename: 'User',
      _id: pricingPlan.updatedBy,
    };
  },

  async productIds(
    plan: IPricingPlanDocument,
    _args,
    { subdomain }: IContext,
  ): Promise<string[]> {
    return getProductIdsForPlan(subdomain, plan);
  },
  async fixedValues(plan: IPricingPlanDocument, _args, { models }: IContext) {
    return models.PricingFixedValues.find({
      pricingPlanId: plan._id.toString(),
    }).sort({ sortField: 1 });
  },
};

export { PricingPlan };
