import { IContext } from '../../../connectionResolver';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';

const pricingPlanQueries = {
  pricingPlans: async (
    _root: any,
    { status }: { status: string },
    { models }: IContext
  ) => {
    let filter: any = {};

    if (status && status.length !== 0) filter.status = status;

    return await models.PricingPlans.find(filter)
      .sort({ updatedAt: -1 })
      .lean();
  },

  pricingPlanDetail: async (
    _root: any,
    { id }: { id: string },
    { models }: IContext
  ) => {
    return await models.PricingPlans.findById(id);
  }
};

moduleRequireLogin(pricingPlanQueries);
moduleCheckPermission(pricingPlanQueries, 'showPricing');

export default pricingPlanQueries;
