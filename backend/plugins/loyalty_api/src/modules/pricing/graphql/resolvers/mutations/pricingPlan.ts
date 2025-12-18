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
    return models.PricingPlans.createPlan(doc, user._id);
  },

  pricingPlanEdit: async (
    _root: any,
    { doc }: { doc: IPricingPlanDocument },
    { models, user }: IContext,
  ) => {
    return models.PricingPlans.updatePlan(
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
    return models.PricingPlans.removePlan(id);
  },
};


(async () => {
  moduleRequireLogin(pricingPlanMutations);
  await moduleCheckPermission(pricingPlanMutations, 'managePricing');
})();

export default pricingPlanMutations;
