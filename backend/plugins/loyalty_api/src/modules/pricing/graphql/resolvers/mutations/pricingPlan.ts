import type { IContext } from '~/connectionResolvers';
import type {
  IPricingPlan,
  IPricingPlanDocument,
} from '../../../@types/pricingPlan';
import {
  moduleRequireLogin,
  moduleCheckPermission,
} from 'erxes-api-shared/core-modules';

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

/**
 * 🔑 Apply auth & permissions AFTER defining resolvers
 */
moduleRequireLogin(pricingPlanMutations);
moduleCheckPermission(pricingPlanMutations, 'managePricing');
