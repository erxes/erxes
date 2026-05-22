import type { IContext } from '~/connectionResolvers';
import type {
  IPricingPlan,
  IPricingPlanDocument,
} from '../../../@types/pricingPlan';

export const pricingPlanMutations = {
  pricingPlanAdd: async (
    _root: any,
    { doc }: { doc: IPricingPlan },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanCreate');
    return models.PricingPlans.createPlan(doc, user._id);
  },

  pricingPlanEdit: async (
    _root: any,
    { doc }: { doc: IPricingPlanDocument },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanUpdate');
    return models.PricingPlans.updatePlan(doc._id, doc, user._id);
  },

  pricingPlanRemove: async (
    _root: any,
    { id }: { id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanRemove');
    return models.PricingPlans.removePlan(id);
  },
};