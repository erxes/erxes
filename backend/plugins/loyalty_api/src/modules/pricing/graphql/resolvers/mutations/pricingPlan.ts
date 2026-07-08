import type { IContext } from '~/connectionResolvers';
import type {
  IPricingPlan,
  IPricingPlanDocument,
} from '../../../@types/pricingPlan';
import { recalculatePublicPricingPlanDiscounts } from '../../../utils/publicDiscounts';

export const pricingPlanMutations = {
  pricingPlanAdd: async (
    _root: unknown,
    { doc }: { doc: IPricingPlan },
    { models, subdomain, user, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanCreate');
    const plan = await models.PricingPlans.createPlan(doc, user._id);
    await recalculatePublicPricingPlanDiscounts({ models, subdomain });
    return plan;
  },

  pricingPlanEdit: async (
    _root: unknown,
    { doc }: { doc: IPricingPlanDocument },
    { models, subdomain, user, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanUpdate');
    const plan = await models.PricingPlans.updatePlan(doc._id, doc, user._id);
    await recalculatePublicPricingPlanDiscounts({ models, subdomain });
    return plan;
  },

  pricingPlanRemove: async (
    _root: unknown,
    { id }: { id: string },
    { models, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanRemove');
    const plan = await models.PricingPlans.removePlan(id);
    await recalculatePublicPricingPlanDiscounts({ models, subdomain });
    return plan;
  },

  pricingPlansRecalculatePublicDiscounts: async (
    _root: unknown,
    _params: Record<string, never>,
    { models, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanUpdate');
    return recalculatePublicPricingPlanDiscounts({ models, subdomain });
  },
};
