import { IContext } from '~/connectionResolvers';
import {
  IPricingPlan,
  IPricingPlanDocument,
} from '@/pricing/@types/pricingPlan';
import {
  moduleRequireLogin,
  moduleCheckPermission,
} from 'erxes-api-shared/core-modules';

const PRICING_PLAN = 'pricingPlan';

export const pricingPlanMutations = {
  pricingPlanAdd: async (
    _root: any,
    { doc }: { doc: IPricingPlan },
    { models, user }: IContext,
  ) => {
    return await models.PricingPlans.createPlan(doc, user._id);
  },

  pricingPlanEdit: async (
    _root: any,
    { doc }: { doc: IPricingPlanDocument },
    { models, user }: IContext,
  ) => {
    const pricingPlan = await models.PricingPlans.findOne({ _id: doc._id });

    if (!pricingPlan) {
      throw new Error('Pricing plan not found');
    }

    return await models.PricingPlans.updatePlan(
      doc._id,
      doc,
      user._id,
    );
  },

  pricingPlanRemove: async (
    _root: any,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    const pricingPlan = await models.PricingPlans.findOne({ _id: id });

    if (!pricingPlan) {
      throw new Error('Pricing plan not found');
    }

    return await models.PricingPlans.removePlan(id);
  },
};

moduleRequireLogin(pricingPlanMutations);
moduleCheckPermission(pricingPlanMutations, 'managePricing');

export default pricingPlanMutations;
