import type { IContext } from '~/connectionResolvers';
import type {
  IPricingPlan,
  IPricingPlanDocument,
} from '@/pricing/@types/pricingPlan';
import {
  moduleRequireLogin,
  moduleCheckPermission,
} from 'erxes-api-shared/core-modules';

export const pricingPlanMutations = {
  pricingPlanAdd: moduleRequireLogin(
    moduleCheckPermission(
      async (
        _root: any,
        { doc }: { doc: IPricingPlan },
        { models, user }: IContext,
      ) => {
        return models.PricingPlans.createPlan(doc, user._id);
      },
      'managePricing',
    ),
  ),

  pricingPlanEdit: moduleRequireLogin(
    moduleCheckPermission(
      async (
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
      'managePricing',
    ),
  ),

  pricingPlanRemove: moduleRequireLogin(
    moduleCheckPermission(
      async (
        _root: any,
        { id }: { id: string },
        { models }: IContext,
      ) => {
        return models.PricingPlans.removePlan(id);
      },
      'managePricing',
    ),
  ),
};

export default pricingPlanMutations;
