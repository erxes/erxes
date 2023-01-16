import { IContext, models } from '../../../connectionResolver';
import {
  IPricingPlan,
  IPricingPlanDocument
} from '../../../models/definitions/pricingPlan';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';

const pricingPlanMutations = {
  pricingPlanAdd: async (
    _root: any,
    { doc }: { doc: IPricingPlan },
    { models, user }: IContext
  ) => {
    return await models.PricingPlans.createPlan(doc, user._id);
  },

  pricingPlanEdit: async (
    _root: any,
    { doc }: { doc: IPricingPlanDocument },
    { models, user }: IContext
  ) => {
    return await models.PricingPlans.updatePlan(doc._id, doc, user._id);
  },

  pricingPlanRemove: async (
    _root: any,
    { id }: { id: string },
    { models }: IContext
  ) => {
    return await models.PricingPlans.removePlan(id);
  }
};

moduleRequireLogin(pricingPlanMutations);
moduleCheckPermission(pricingPlanMutations, 'managePricing');

export default pricingPlanMutations;
